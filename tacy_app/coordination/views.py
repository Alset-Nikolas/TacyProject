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
from components.models import (
    Initiatives,
    InitiativesMetricsFields,
    MetricsProject,
)
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from projects.models import Project
from components.models import RolesUserInInitiative
from components.serializers import CommunityRolesInInitiativeSerializer
from django.contrib.auth import get_user_model
from notifications.models import NotificationsUser
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

User = get_user_model()


class CoordinationHistory(views.APIView):
    @swagger_auto_schema(
        operation_description="История чата",
        manual_parameters=[
            openapi.Parameter(
                name="id",
                in_=openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                description="ID инициативы",
            )
        ],
    )
    def get(self, request, form=None):
        id_init = request.GET.get("id")
        if not id_init or not id_init.isdigit():
            return Response({"msg": "not init id valid"}, 400)
        initiative: Initiatives = get_object_or_404(
            Initiatives, id=request.GET.get("id")
        )
        serializer = CoordinationHistorySerializer(
            instance={"history_coordination": initiative.history_coordination}
        )
        return Response(serializer.data, 200)


class SentForApproval(views.APIView):
    def _send_email(self, email, info):
        init = info.get("initiative")
        author = info.get("author_text")
        TEXT = f"Проект: {init.project.name}\nИнициатива: {init.name}\nАвтор сообщения: {author.last_name} {author.first_name} {author.second_name}\nСодержание: {info.get('text', '')}\n"
        msg = EmailMultiAlternatives(
            subject=f"Запрос на согласование инициативы в приложении {settings.SITE_FULL_NAME}",
            body=TEXT
            + f"Для ответа перейдите по ссылке {settings.SITE_DOMAIN}",
            from_email=settings.EMAIL_HOST_USER,
            to=[email],
        )
        msg.send(fail_silently=True)

    def _get_status_initiative(self, id):
        init = Initiatives.get_by_id(id)
        return init.status

    @swagger_auto_schema(
        operation_description="Отправить на согласование инициативу",
        request_body=SentForApprovalSerializer,
    )
    def post(self, request):
        data = request.data
        data["text"] = "Отправил на согласование"
        serializer = SentForApprovalSerializer(
            data=data, context={"user": request.user}
        )
        serializer.is_valid(raise_exception=True)
        for user_info in serializer.data.get("coordinators"):
            coordinator_user = User.get_user_by_id(user_info.get("id"))

            initiative_id = serializer.data.get("initiative")
            initiative = Initiatives.get_by_id(initiative_id)
            status = self._get_status_initiative(initiative_id)

            instace = {
                "initiative": initiative,
                "status": status,
                "coordinator": coordinator_user,
                "author_text": request.user,
                "text": request.data.get("text"),
                "action": TYPE_SEND_APPROVAL,
            }
            self._send_email(email=coordinator_user.email, info=instace)
            CoordinationInitiativeHistory.create(instace)
            NotificationsUser.sent_approval(instace)

            instace = {
                "initiative_id": initiative_id,
                "status": status,
                "coordinator_stage": coordinator_user,
            }
            StagesCoordinationInitiative.add_stage(instace)

        return Response("Отправили на согласование удачно", 200)


class InfoInitiativeRole(views.APIView):
    @swagger_auto_schema(
        operation_description="Роль пользователя в инициативе",
        manual_parameters=[
            openapi.Parameter(
                name="id",
                in_=openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                description="ID инициативы",
            )
        ],
    )
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
                "init_file_ready": initiative.get_file_status(),
                "user_is_author": user == initiative.author,
                "user_is_superuser": user.is_superuser,
                "user_now_apprwed": flag,
                "user_add_comment": CoordinationInitiativeHistory.check_person_add_comment(
                    initiative_id, user
                ),
                "user_rights_flag": Initiatives.get_user_rigts(
                    user, initiative
                ),
            },
            200,
        )


class AddComment(views.APIView):
    def _send_email(self, email, instace):
        initiative = instace.get("initiative")
        author = instace.get("author_text")
        TEXT = f"Проект: {initiative.project.name}\nИнициатива: {initiative.name}\nАвтор сообщения: {author.last_name} {author.first_name} {author.second_name}\nСодержание: {instace.get('text')}\n"
        msg = EmailMultiAlternatives(
            subject=f"Новое сообщение в обсуждении инициативы в приложении '{settings.SITE_FULL_NAME}'",
            body=TEXT
            + f"Для ответа перейдите по ссылке {settings.SITE_DOMAIN}",
            from_email=settings.EMAIL_HOST_USER,
            to=[email],
        )
        msg.send(fail_silently=True)

    @swagger_auto_schema(
        operation_description="Добавить сообщение в чат.",
        request_body=AddCommentSerializer,
    )
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

        instace = {
            "initiative": initiative,
            "status": initiative.status,
            "coordinator": None,
            "author_text": request.user,
            "text": request.data.get("text"),
            "action": TYPE_NEW_COMMENT,
        }
        for coordinator in coordinators:
            self._send_email(email=coordinator.email, instace=instace)

        CoordinationInitiativeHistory.create(instace)
        users = StagesCoordinationInitiative.get_coordinators(initiative)
        NotificationsUser.add_comment(initiative, users)
        return Response(
            "Новый комментарий добавлен",
            200,
        )


class Approval(views.APIView):
    def _send_email(self, email, initiative):
        TEXT = f"Проект: {initiative.project.name}\nИнициатива: {initiative.name}\n"
        msg = EmailMultiAlternatives(
            subject=f"Ваша инициатива согласована'{settings.SITE_FULL_NAME}'",
            body=TEXT
            + f"Для ответа перейдите по ссылке {settings.SITE_DOMAIN}",
            from_email=settings.EMAIL_HOST_USER,
            to=[email],
        )
        msg.send(fail_silently=True)

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
            self._send_email(
                email=initiative.author.email, initiative=initiative
            )
            self._add_history_change_stage(request, old_state_name)
            if initiative.status.value == -1:
                initiative.activate = True
                self._add_history_initiative_activate(request)
                initiative.save()

    @swagger_auto_schema(
        operation_description="Согласовать на очередном этапе.",
        request_body=ApprovalSerializer,
    )
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
    @swagger_auto_schema(
        operation_description="Переключатель инициативы (отозовать)",
        request_body=SwitchSerializer,
    )
    def post(self, request):
        user: User = request.user
        serializer = SwitchSerializer(
            data=request.data, context={"user": user}
        )
        serializer.is_valid(raise_exception=True)

        initiative = get_object_or_404(
            Initiatives, pk=request.data.get("initiative")
        )
        initiative.failure = request.data.get("failure")
        initiative.save()
        text = "отозвана" if initiative.failure else "активна"
        print("ДО", initiative.status)
        if initiative.failure:
            print("Ставим статус failure")
            Initiatives.get_status_failure(initiative)
            for metric_obj in initiative.metric_fields.all():
                metric_id = metric_obj.metric.id
                delta = metric_obj.value
                MetricsProject.add_delta_value(metric_id, -delta)
            
        else:
            print("Ставим статус start")
            Initiatives.get_status_start(initiative)
            for metric_obj in initiative.metric_fields.all():
                metric_id = metric_obj.metric.id
                delta = metric_obj.value
                MetricsProject.add_delta_value(metric_id, delta)
        print("POSLE", initiative.status)
        return Response(
            f"Инициатива {text} initiative_status{initiative.status}",
            200,
        )


class CommunityViews(views.APIView):
    def get(self, request):
        initiative = get_object_or_404(
            Initiatives, id=self.request.GET.get("id")
        )
        community_roles = initiative.get_community_roles()
        ans = []
        for community_item in community_roles:
            if community_item.get("role").is_approve:
                ans.append(community_item)
        s = CommunityRolesInInitiativeSerializer(instance=ans, many=True)
        return Response(
            s.data,
            200,
        )
