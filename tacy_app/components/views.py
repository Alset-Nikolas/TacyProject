import typing as tp

from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404, render
from rest_framework import status, views
from rest_framework.response import Response
from projects.models import Project, MetricsProject
from .serializers import (
    ListInitiativeSerializer,
    SettingsInitiativeSerializer,
    InfoSettingsInitiativeSerializer,
    # CreateInitiativeSerializer,
    InitiativeSerializer,
    InitiativesAddFields,
    RiskInfoSerializer,
    ListRiskSerializer,
    EventSerializer,
    ListEventSerializer,
    UserPersonStatisticSerializer,
)
from projects.serializers import UserProjectIdSerializer
from .models import (
    SettingsComponents,
    Initiatives,
    Risks,
    Events,
    InitiativesMetricsFields,
    EventMetricsFields,
)
from rest_framework.response import Response


def get_project_by_id_or_active(request) -> tp.Optional[Project]:
    """
    Выбор проекту:
        если есть параметр в запроме то по нему
        иначе - активный проект у пользователя
    """
    user = request.user
    project_id: int = request.GET.get("id", None)
    if not project_id:
        return user.project_active
    UserProjectIdSerializer(
        data={"id": project_id},
        context={"user": user},
    ).is_valid(raise_exception=True)
    project = get_object_or_404(Project, id=project_id)
    user.project_active = project
    user.save()
    return project


# ++++++++++++++++++++++ИНИЦИАТИВА+++++++++++++++++++++++++++
class CreateInitiativeView(views.APIView):
    def post(self, request):
        project_id = request.data.get("initiative", {}).get("project", None)
        project = Project.get_project_by_id(project_id)
        data = request.data
        data["initiative"] = request.data.get("initiative", {})
        data["initiative"]["author"] = request.user.id
        s = InitiativeSerializer(
            data=request.data,
            context={"user": request.user, "project": project},
        )
        s.is_valid(raise_exception=True)
        s.create_or_update(request.data)
        return Response(request.data, 200)


class InfoInitiativeView(views.APIView):
    def get(self, request):
        if not request.GET.get("id", None):
            return Response("get id initiative", 404)
        init: Initiatives = get_object_or_404(
            Initiatives, id=request.GET.get("id")
        )
        init.check_updates()
        s = InitiativeSerializer(
            instance={
                "initiative": init,
                "addfields": init.addfields.all(),
                "properties_fields": init.properties_fields.all(),
                "metric_fields": init.metric_fields.all(),
            }
        )
        return Response(s.data, 200)


# ++++++++++++++++++++++РИСКИ+++++++++++++++++++++++++++
class CreateRiskView(views.APIView):
    def post(self, request):
        initiative_id = request.data.get("risk", {}).get("initiative", None)

        s: RiskInfoSerializer = RiskInfoSerializer(
            data=request.data,
            context={
                "initiative": get_object_or_404(Initiatives, id=initiative_id)
            },
        )
        s.is_valid(raise_exception=True)
        s.create_or_update(s.data)
        return Response(s.data, 200)


class InfoRiskView(views.APIView):
    def get(self, request):
        id_initiative = request.GET.get("id", None)
        risc_obj = get_object_or_404(Risks, id=id_initiative)
        risc_obj.check_updates()
        s = RiskInfoSerializer(
            instance={
                "risk": risc_obj,
                "addfields": risc_obj.addfields.all(),
            }
        )
        return Response(s.data, 200)


class UpdateSettingsInitiativeView(views.APIView):
    def post(self, request):
        serializer = SettingsInitiativeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.create_or_update(request.data)
        return Response(
            {"msg": "settings initiative update", "code": 200}, 200
        )

    def get(self, request):
        project: Project = get_project_by_id_or_active(request)
        settings_initiatives = project.settings_initiatives.first()
        instance_ = {
            "settings": settings_initiatives,
            "table_registry": {
                "properties": project.properties,
                "metrics": project.metrics,
            },
        }
        serializer = InfoSettingsInitiativeSerializer(instance=instance_)
        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


class ListInitiativesView(views.APIView):
    """
    Выдать список инициатив проекта
    """

    def get(self, request):
        project = get_project_by_id_or_active(request)
        list_inits = project.initiatives.all()
        [x.check_updates() for x in list_inits]
        inst = {
            "project_initiatives": [
                {
                    "initiative": initiative,
                    "addfields": initiative.addfields.all(),
                    "properties_fields": initiative.properties_fields.all(),
                    "metric_fields": initiative.metric_fields.all(),
                }
                for initiative in list_inits
            ]
        }
        s = ListInitiativeSerializer(instance=inst)
        return Response(s.data, 200)


class UserStatisticsInitiativesView(views.APIView):
    """
    Выдать список инициатив проекта (в которых пользователь был задействован)
    """

    def _get_user_statistic(self, project, inits):
        metrics_user_stat = {}
        user_initiatives = []
        events = []
        for m in MetricsProject.objects.filter(project=project).all():
            if m.active:
                metrics_user_stat[m.title] = 0
        for initiative in inits:
            user_initiatives.append(
                {
                    "initiative": initiative,
                    "addfields": initiative.addfields.all(),
                    "properties_fields": initiative.properties_fields.all(),
                    "metric_fields": initiative.metric_fields.all(),
                }
            )
            for m_obj in initiative.metric_fields.all():
                title = m_obj.metric.title
                if title in metrics_user_stat:
                    metrics_user_stat[m_obj.metric.title] += m_obj.value
            events += initiative.events.all()
        metrics_user_stat_format = []
        for k, v in metrics_user_stat.items():
            metrics_user_stat_format.append({"title": k, "value": v})
        return {
            "user_initiatives": user_initiatives,
            "metrics_user_stat": metrics_user_stat_format,
            "events": events,
        }

    def get(self, request):
        project = get_project_by_id_or_active(request)
        user = request.user
        list_inits = []
        list_inits = Initiatives.get_user_initiatievs(user, project)

        [x.check_updates() for x in list_inits]

        s = UserPersonStatisticSerializer(
            instance=self._get_user_statistic(project, list_inits)
        )
        self._get_user_statistic(project, list_inits)
        return Response(s.data, 200)


class ListRiskView(views.APIView):
    """
    Выдать список инициатив проекта
    """

    def get(self, request):

        id = request.GET.get("id", None)
        initiative = get_object_or_404(Initiatives, id=id)
        risks = initiative.risks.all()
        print(risks)
        [x.check_updates() for x in risks]
        inst = {
            "initiative_risks": [
                {
                    "risk": risk,
                    "addfields": risk.addfields.all(),
                }
                for risk in risks
            ]
        }
        s = ListRiskSerializer(instance=inst)
        return Response(s.data, 200)


class InfoEventView(views.APIView):
    def get(self, request):
        id_event = request.GET.get("id", None)
        if not id_event:
            return Response("get id event", 404)
        event = get_object_or_404(Events, id=id_event)
        event.check_updates()
        s = EventSerializer(
            instance={
                "event": event,
                "event_status": event.get_status(event),
                "addfields": event.addfields.all(),
                "metric_fields": event.metric_fields.all(),
            }
        )
        return Response(s.data, 200)


class CreateEventView(views.APIView):
    def post(self, request):
        initiative_id = request.data.get("event", {}).get("initiative", None)
        initiative = get_object_or_404(Initiatives, id=initiative_id)
        data = request.data

        s: EventSerializer = EventSerializer(
            data=data, context={"initiative": initiative, "user": request.user}
        )
        s.is_valid(raise_exception=True)
        data["event"]["author"] = request.user
        s.create_or_update(data)
        return Response(s.data, 200)


class DeleteEventView(views.APIView):
    def post(self, request):
        id_event = request.GET.get("id", None)
        if not id_event:
            return Response("get id event", 404)
        event: Events = get_object_or_404(Events, id=id_event)
        Events.delete_event(id_event)
        return Response("ok", 200)


class ListEventView(views.APIView):
    def get(self, request):

        id = request.GET.get("id", None)
        initiative = get_object_or_404(Initiatives, id=id)
        events = initiative.events.all()
        [x.check_updates() for x in events]
        inst = {
            "initiative_events": [
                {
                    "event": event,
                    "event_status": event.get_status(event),
                    "metric_fields": initiative.metric_fields.all(),
                    "addfields": event.addfields.all(),
                }
                for event in initiative.events.all()
            ]
        }
        s = ListEventSerializer(instance=inst)
        return Response(s.data, 200)


class DeleteRiskView(views.APIView):
    def post(self, request):
        project = get_project_by_id_or_active(request)
        project.risks.delete()
        return Response("risks delete ok", 200)
