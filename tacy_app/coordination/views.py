from django.shortcuts import render
from rest_framework import views
from .serializers import (
    CoordinationHistorySerializer,
    CoordinationHistorySerializer,
    SentForApprovalSerializer,
    AddCommentSerializer,
    ApprovalSerializer,
    SwitchSerializer,
)
from .models import (
    CoordinationInitiativeHistory,
    StagesCoordinationInitiative,
    TYPE_SERVICE_MESSAGE,
    TYPE_SEND_APPROVAL,
    TYPE_INITIATIVE_AGREED,
    TYPE_NEW_COMMENT,
)
from components.models import Initiatives
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from projects.models import Project
from django.contrib.auth import get_user_model
from notifications.models import NotificationsUser

User = get_user_model()


class CoordinationHistory(views.APIView):
    def get(self, request, form=None):
        initiative: Initiatives = get_object_or_404(
            Initiatives, id=request.GET.get("id")
        )
        serializer = CoordinationHistorySerializer(
            instance={"history_coordination": initiative.history_coordination}
        )
        return Response(serializer.data, 200)


class SentForApproval(views.APIView):
    def _send_email(self, email):
        msg = EmailMultiAlternatives(
            subject=f"Запрос на согласование инициативы в приложении {settings.SITE_FULL_NAME}",
            body=f"Перейдите по ссылке {settings.SITE_DOMAIN}",
            from_email=settings.EMAIL_HOST_USER,
            to=[email],
        )
        msg.send()

    def _get_status_initiative(self, id):
        init = Initiatives.get_by_id(id)
        return init.status

    def post(self, request):
        serializer = SentForApprovalSerializer(
            data=request.data, context={"user": request.user}
        )
        serializer.is_valid(raise_exception=True)

        coordinator_obj = User.get_user_by_id(request.data.get("coordinator"))
        self._send_email(email=coordinator_obj.email)

        initiative_id = request.data.get("initiative")
        status = self._get_status_initiative(initiative_id)

        instace = {
            "initiative_id": initiative_id,
            "status": status,
            "coordinator": coordinator_obj,
            "author_text": request.user,
            "text": request.data.get("text"),
            "action": TYPE_SEND_APPROVAL,
        }
        print(instace)
        CoordinationInitiativeHistory.create(instace)
        initiative = Initiatives.get_by_id(initiative_id)
        NotificationsUser.sent_approval(initiative, instace)

        instace = {
            "initiative_id": initiative_id,
            "status": status,
            "coordinator_stage": coordinator_obj,
        }
        StagesCoordinationInitiative.add_stage(instace)

        return Response("Отправили на согласование удачно", 200)


class InfoInitiativeRole(views.APIView):
    def get(self, request):
        user = request.user
        initiative_id = request.GET.get("id")
        initiative: Initiatives = get_object_or_404(
            Initiatives, id=initiative_id
        )
        status = initiative.status
        flag = False
        stage_user_info = (
            StagesCoordinationInitiative.check_coordinator_status(
                initiative_id, user, status
            )
        )
        if stage_user_info and not stage_user_info.activate:
            flag = True
        return Response(
            {
                "init_activate": initiative.activate,
                "init_failure": initiative.failure,
                "user_is_author": user == initiative.author,
                "user_is_superuser": user.is_superuser,
                "user_now_apprwed": flag,
                "user_add_comment": CoordinationInitiativeHistory.check_person_add_comment(
                    initiative_id, user
                ),
                "user_rights_flag": Project.get_user_rights_flag_in_project(
                    user, initiative.project
                ),
            },
            200,
        )


class AddComment(views.APIView):
    def _send_email(self, email):
        msg = EmailMultiAlternatives(
            subject=f"Новое сообщение в обсуждении инициативы в приложении '{settings.SITE_FULL_NAME}'",
            body=f"Перейдите по ссылке {settings.SITE_DOMAIN}",
            from_email=settings.EMAIL_HOST_USER,
            to=[email],
        )
        msg.send()

    def post(self, request):
        user: User = request.user
        serializer = AddCommentSerializer(
            data=request.data, context={"user": user}
        )
        serializer.is_valid(raise_exception=True)
        initiative = Initiatives.get_by_id(request.data.get("initiative"))
        coordinators: list[
            StagesCoordinationInitiative
        ] = StagesCoordinationInitiative.get_coordinators(initiative)
        for coordinator in coordinators:
            self._send_email(email=coordinator.email)

        instace = {
            "initiative": initiative,
            "status": initiative.status,
            "coordinator": None,
            "author_text": request.user,
            "text": request.data.get("text"),
            "action": TYPE_NEW_COMMENT,
        }

        CoordinationInitiativeHistory.create(instace)
        users = StagesCoordinationInitiative.get_coordinators(initiative)
        NotificationsUser.add_comment(instace, users)
        return Response(
            "Новый комментарий добавлен",
            200,
        )


class Approval(views.APIView):
    def _send_email(self, email):
        msg = EmailMultiAlternatives(
            subject=f"Ваша инициатива согласована'{settings.SITE_FULL_NAME}'",
            body=f"Перейдите по ссылке {settings.SITE_DOMAIN}",
            from_email=settings.EMAIL_HOST_USER,
            to=[email],
        )
        msg.send()

    def _add_history_approval(self, request):
        initiative = Initiatives.get_by_id(request.data.get("initiative"))
        instace = {
            "initiative": initiative,
            "status": initiative.status,
            "coordinator": request.user,
            "author_text": request.user,
            "text": request.data.get("text"),
            "action": TYPE_INITIATIVE_AGREED,
        }
        CoordinationInitiativeHistory.create(instace)
        NotificationsUser.init_approval(initiative)

    def _add_history_change_stage(self, request, state_name):
        initiative = Initiatives.get_by_id(request.data.get("initiative"))
        instace = {
            "initiative": initiative,
            "status": initiative.status,
            "coordinator": None,
            "author_text": None,
            "text": f"Инициатива одобрена на очередном этапе. Пройден этап: {state_name}",
            "action": TYPE_SERVICE_MESSAGE,
        }
        CoordinationInitiativeHistory.create(instace)
        NotificationsUser.change_stage(initiative, state_name)

    def _add_history_initiative_activate(self, request):
        initiative = Initiatives.get_by_id(request.data.get("initiative"))
        instace = {
            "initiative": initiative,
            "status": initiative.status,
            "coordinator": None,
            "author_text": None,
            "text": f"Инициатива согласована!",
            "action": TYPE_SERVICE_MESSAGE,
        }
        CoordinationInitiativeHistory.create(instace)
        NotificationsUser.init_approval(initiative)

    def _update_stage_initiative(self, request):
        initiative = Initiatives.get_by_id(request.data.get("initiative"))
        coordinator_info = (
            StagesCoordinationInitiative.check_coordinator_status(
                initiative_id=initiative.id,
                coordinator=request.user,
                status=initiative.status,
            )
        )
        coordinator_info.activate = True
        coordinator_info.save()
        old_state_name = initiative.status.name
        if StagesCoordinationInitiative.check_update_status(initiative):
            initiative = Initiatives.get_by_id(request.data.get("initiative"))
            self._send_email(email=initiative.author.email)
            self._add_history_change_stage(request, old_state_name)
            if initiative.status.value == -1:
                initiative.activate = True
                self._add_history_initiative_activate(request)
                initiative.save()

    def post(self, request):
        user: User = request.user
        serializer = ApprovalSerializer(
            data=request.data, context={"user": user}
        )
        serializer.is_valid(raise_exception=True)
        self._add_history_approval(request)
        self._update_stage_initiative(request)

        return Response(
            TYPE_INITIATIVE_AGREED,
            200,
        )


class Switch(views.APIView):
    def post(self, request):
        user: User = request.user
        serializer = SwitchSerializer(
            data=request.data, context={"user": user}
        )
        serializer.is_valid(raise_exception=True)
        initiative = Initiatives.get_by_id(request.data.get("initiative"))
        initiative.failure = request.data.get("failure")
        initiative.save()
        text = "отозвана" if initiative.failure else "активна"
        if initiative.failure:
            Initiatives.get_status_failure(initiative)
        else:
            Initiatives.get_status_start(initiative)

        return Response(
            f"Инициатива {text}",
            200,
        )
