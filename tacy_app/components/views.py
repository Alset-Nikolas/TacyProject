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
    InitiativeSerializer,
    InitiativesAddFields,
    RiskInfoSerializer,
    ListRiskSerializer,
    EventSerializer,
    ListEventSerializer,
    UserPersonStatisticSerializer,
    DeleteRiskSerializer,
    RolesUserInInitiativeSerializer,
    SettingsFilesInitiativeSerializer,
    InfoInitiativesFilesSerializer,
)
from projects.serializers import UserProjectIdSerializer
from .models import (
    SettingsComponents,
    Initiatives,
    Risks,
    Events,
    InitiativesMetricsFields,
    EventMetricsFields,
    SettingsFilesInitiative,
    SettingsStatusInitiative,
)
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.conf import settings
from .permissions import (
    IsUserCreatorInitiativesOrAdminPermission,
    IsUserAuthorInitiativesOrAdminPermission,
    IsUserUpdateInitiativesOrAdminPermission,
)


def get_project_by_id_or_active(request) -> tp.Optional[Project]:
    """
    Выбор проекту:
        если есть параметр в запроме то по нему
        иначе - активный проект у пользователя
    """
    user = request.user
    project_id: int = request.GET.get("id")
    UserProjectIdSerializer(
        data={"id": project_id},
        context={"user": user},
    ).is_valid(raise_exception=True)
    return get_object_or_404(Project, id=project_id)


# ++++++++++++++++++++++НАСТРОЙКИ+++++++++++++++++++++++++++


class UpdateSettingsInitiativeView(views.APIView):
    response_schema_dict = {
        "200": openapi.Response(
            description="Настройки компонентов.",
            examples={
                "application/json": {
                    "settings": {
                        "id": 2,
                        "initiative_status": [
                            {
                                "id": 3,
                                "value": -1,
                                "name": "Согласовано",
                                "settings_project": 2,
                            },
                            {
                                "id": 4,
                                "value": -2,
                                "name": "Отозвано",
                                "settings_project": 2,
                            },
                            {
                                "id": 5,
                                "value": 0,
                                "name": "L0",
                                "settings_project": 2,
                            },
                            {
                                "id": 6,
                                "value": 1,
                                "name": "L1",
                                "settings_project": 2,
                            },
                            {
                                "id": 7,
                                "value": 2,
                                "name": "L2",
                                "settings_project": 2,
                            },
                            {
                                "id": 8,
                                "value": 3,
                                "name": "L3",
                                "settings_project": 2,
                            },
                            {
                                "id": 9,
                                "value": 4,
                                "name": "L4",
                                "settings_project": 2,
                            },
                            {
                                "id": 10,
                                "value": 5,
                                "name": "L5",
                                "settings_project": 2,
                            },
                        ],
                        "initiative_addfields": [
                            {
                                "id": 1,
                                "title": "Качественный эффект",
                                "type": "str",
                                "settings_project": 2,
                            }
                        ],
                        "event_addfields": [],
                        "risks_addfields": [
                            {
                                "id": 1,
                                "title": "Описание риска",
                                "type": "str",
                                "settings_project": 2,
                            },
                            {
                                "id": 2,
                                "title": "Митигация риска",
                                "type": "str",
                                "settings_project": 2,
                            },
                        ],
                    },
                    "table_registry": {
                        "properties": [
                            {
                                "id": 1,
                                "title": "Подразделения",
                                "initiative_activate": True,
                                "items": [
                                    {"id": 1, "value": "КХП", "propertie": 1},
                                    {"id": 2, "value": "ОГЦ", "propertie": 1},
                                ],
                            },
                            {
                                "id": 2,
                                "title": "Программы",
                                "initiative_activate": True,
                                "items": [
                                    {"id": 3, "value": "ДАТП", "propertie": 2},
                                    {"id": 4, "value": "ДРК", "propertie": 2},
                                    {
                                        "id": 5,
                                        "value": "Развитие",
                                        "propertie": 2,
                                    },
                                    {
                                        "id": 6,
                                        "value": "Умное производство",
                                        "propertie": 2,
                                    },
                                    {"id": 7, "value": "УПП", "propertie": 2},
                                ],
                            },
                        ],
                        "metrics": [
                            {
                                "id": 2,
                                "title": "млн.руб.",
                                "initiative_activate": True,
                                "units": "бм",
                            },
                            {
                                "id": 3,
                                "title": "ШЕ",
                                "initiative_activate": True,
                                "units": "бм",
                            },
                        ],
                    },
                }
            },
        ),
        "400": openapi.Response(
            description="Передан id несуществующего проекта",
            examples={
                "application/json": {"id": ["project pk = 100 not exist"]}
            },
        ),
        "401": openapi.Response(
            description="Токен идентификации не был передан",
            examples={
                "application/json": {
                    "detail": "Учетные данные не были предоставлены."
                }
            },
        ),
    }

    @swagger_auto_schema(
        operation_description="Команда проекта",
        responses=response_schema_dict,
        request_body=SettingsInitiativeSerializer,
    )
    def post(self, request):
        project: Project = get_project_by_id_or_active(request)
        serializer = SettingsInitiativeSerializer(
            data=request.data, context={"project": project}
        )
        serializer.is_valid(raise_exception=True)
        serializer.create_or_update(request.data)
        return Response(
            {"msg": "settings initiative update", "code": 200}, 200
        )

    @swagger_auto_schema(
        operation_description="Команда проекта",
        responses=response_schema_dict,
        manual_parameters=[
            openapi.Parameter(
                name="id",
                in_=openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                description="ID проекта",
            )
        ],
    )
    def get(self, request):
        project: Project = get_project_by_id_or_active(request)
        settings_initiatives = project.settings_initiatives.first()
        instance_ = {
            "settings": settings_initiatives,
            "table_registry": {
                "properties": project.properties,
                "metrics": project.metrics,
                "roles": project.roles,
            },
            "table_community": {
                "properties": project.properties,
                "settings_addfields_community": project.community_settings,
            },
        }
        serializer = InfoSettingsInitiativeSerializer(instance=instance_)
        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


# ++++++++++++++++++++++ИНИЦИАТИВЫ+++++++++++++++++++++++++++
class CreateInitiativeView(views.APIView):
    permission_classes = [IsUserCreatorInitiativesOrAdminPermission]
    response_schema_dict = {
        "400": openapi.Response(
            description="Передан id несуществующей проекта",
            examples={
                "application/json": {"initiative": {"project": "not exist"}}
            },
        ),
        "401": openapi.Response(
            description="Токен идентификации не был передан",
            examples={
                "application/json": {
                    "detail": "Учетные данные не были предоставлены."
                }
            },
        ),
    }

    @swagger_auto_schema(
        operation_description="Создать инициативу",
        responses=response_schema_dict,
        request_body=InitiativeSerializer,
    )
    def post(self, request):
        project_id = request.data.get("initiative", {}).get("project", None)
        project = Project.get_project_by_id(project_id)
        self.check_object_permissions(self.request, project)
        if not project:
            return Response({"initiative": {"project": "not exist"}}, 400)
        data = request.data
        data["initiative"] = request.data.get("initiative", {})

        s = InitiativeSerializer(
            data=request.data,
            context={"user": request.user, "project": project},
        )
        s.is_valid(raise_exception=True)
        data["initiative"]["author"] = request.user.id
        s.create_or_update(request.data)
        return Response(s.data, 200)


class InfoInitiativeView(views.APIView):
    response_schema_dict = {
        "200": openapi.Response(
            description="Список инициатив проекта",
            examples={
                "application/json": {
                    "initiative": {
                        "id": 1,
                        "project": 2,
                        "author": 1,
                        "name": "Восстановление дробильно-фрезерной машины и вагоноопракидывателя №2",
                        "current_state": "Низкая производительность машины и вагоноопракидывателя из-за износа",
                        "reasons": "Доведение аппаратов до проектного состояния позволит достичь проектных мощностей",
                        "description": "Восстановление существующих систем видеоконтроля за качеством очищенных вагонов в зданиях вагоноопрокидывателей № 1, 2, 3",
                        "date_start": "2023-01-15",
                        "date_end": "2023-08-01",
                        "date_registration": "2022-11-29",
                        "status": {
                            "id": 5,
                            "value": 0,
                            "name": "L0",
                            "settings_project": 2,
                        },
                    },
                    "properties_fields": [
                        {
                            "id": 1,
                            "title": {
                                "id": 1,
                                "title": "Подразделения",
                                "initiative_activate": True,
                            },
                            "value": {"id": 1, "value": "КХП", "propertie": 1},
                        },
                        {
                            "id": 2,
                            "title": {
                                "id": 2,
                                "title": "Программы",
                                "initiative_activate": True,
                            },
                            "value": {"id": 4, "value": "ДРК", "propertie": 2},
                        },
                    ],
                    "metric_fields": [
                        {
                            "metric": {
                                "id": 2,
                                "title": "млн.руб.",
                                "units": "бм",
                                "initiative_activate": True,
                            },
                            "value": 440,
                        },
                        {
                            "metric": {
                                "id": 3,
                                "title": "ШЕ",
                                "units": "бм",
                                "initiative_activate": True,
                            },
                            "value": 0,
                        },
                    ],
                    "addfields": [
                        {
                            "id": 1,
                            "value": "Снижение ручного труда",
                            "title": {
                                "id": 1,
                                "title": "Качественный эффект",
                                "type": "str",
                            },
                        }
                    ],
                }
            },
        ),
        "400": openapi.Response(
            description="Передан id несуществующей проекта",
            examples={"application/json": {"msg": "id init not valid"}},
        ),
        "401": openapi.Response(
            description="Токен идентификации не был передан",
            examples={
                "application/json": {
                    "detail": "Учетные данные не были предоставлены."
                }
            },
        ),
    }

    @swagger_auto_schema(
        operation_description="Информация инициативы",
        responses=response_schema_dict,
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
        id_init = request.GET.get("id", None)
        if not id_init or not id_init.isdigit():
            return Response({"msg": "id init not valid"}, 400)
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
                "roles": init.get_community_roles(),
                "files": init.files.all(),
            }
        )

        return Response(s.data, 200)


class DeleteInitiativeView(views.APIView):
    permission_classes = [IsUserAuthorInitiativesOrAdminPermission]
    response_schema_dict = {
        "200    ": openapi.Response(
            description="Передан id несуществующей проекта",
            examples={"application/json": {"msg": "Инициатива удалена"}},
        ),
        "400": openapi.Response(
            description="Передан id несуществующей проекта",
            examples={"application/json": {"msg": "id init not valid"}},
        ),
        "401": openapi.Response(
            description="Токен идентификации не был передан",
            examples={
                "application/json": {
                    "detail": "Учетные данные не были предоставлены."
                }
            },
        ),
    }

    @swagger_auto_schema(
        operation_description="Удаление инициативы",
        responses=response_schema_dict,
        manual_parameters=[
            openapi.Parameter(
                name="id",
                in_=openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                description="ID инициативы",
            )
        ],
    )
    def delete(self, request):
        id_init = request.GET.get("id", None)
        if not id_init or not id_init.isdigit():
            return Response({"msg": "id init not valid"}, 400)
        init: Initiatives = get_object_or_404(
            Initiatives, id=request.GET.get("id")
        )
        self.check_object_permissions(self.request, init)
        init.delete_node()
        return Response({"msg": "Инициатива удалена"}, 200)


class ListInitiativesView(views.APIView):
    """
    Выдать список инициатив проекта
    """

    response_schema_dict = {
        "200": openapi.Response(
            description="Список инициатив проекта",
            examples={
                "application/json": {
                    "project_initiatives": [
                        {
                            "initiative": {
                                "id": 1,
                                "project": 2,
                                "author": 1,
                                "name": "Восстановление дробильно-фрезерной машины и вагоноопракидывателя №2",
                                "current_state": "Низкая производительность машины и вагоноопракидывателя из-за износа",
                                "reasons": "Доведение аппаратов до проектного состояния позволит достичь проектных мощностей",
                                "description": "Восстановление существующих систем видеоконтроля за качеством очищенных вагонов в зданиях вагоноопрокидывателей № 1, 2, 3",
                                "date_start": "2023-01-15",
                                "date_end": "2023-08-01",
                                "date_registration": "2022-11-29",
                                "status": {
                                    "id": 5,
                                    "value": 0,
                                    "name": "L0",
                                    "settings_project": 2,
                                },
                            },
                            "properties_fields": [
                                {
                                    "id": 1,
                                    "title": {
                                        "id": 1,
                                        "title": "Подразделения",
                                        "initiative_activate": True,
                                    },
                                    "value": {
                                        "id": 1,
                                        "value": "КХП",
                                        "propertie": 1,
                                    },
                                },
                                {
                                    "id": 2,
                                    "title": {
                                        "id": 2,
                                        "title": "Программы",
                                        "initiative_activate": True,
                                    },
                                    "value": {
                                        "id": 4,
                                        "value": "ДРК",
                                        "propertie": 2,
                                    },
                                },
                            ],
                            "metric_fields": [
                                {
                                    "metric": {
                                        "id": 2,
                                        "title": "млн.руб.",
                                        "units": "бм",
                                        "initiative_activate": True,
                                    },
                                    "value": 440,
                                },
                                {
                                    "metric": {
                                        "id": 3,
                                        "title": "ШЕ",
                                        "units": "бм",
                                        "initiative_activate": True,
                                    },
                                    "value": 0,
                                },
                            ],
                            "addfields": [
                                {
                                    "id": 1,
                                    "value": "Снижение ручного труда",
                                    "title": {
                                        "id": 1,
                                        "title": "Качественный эффект",
                                        "type": "str",
                                    },
                                }
                            ],
                        }
                    ]
                }
            },
        ),
        "400": openapi.Response(
            description="Передан id несуществующей проекта",
            examples={
                "application/json": {"id": ["project pk = 1 not exist"]}
            },
        ),
        "401": openapi.Response(
            description="Токен идентификации не был передан",
            examples={
                "application/json": {
                    "detail": "Учетные данные не были предоставлены."
                }
            },
        ),
    }

    @swagger_auto_schema(
        operation_description="Список инициатив в проекте",
        responses=response_schema_dict,
        manual_parameters=[
            openapi.Parameter(
                name="id",
                in_=openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                description="ID проекта",
            )
        ],
    )
    def get(self, request):
        project = get_project_by_id_or_active(request)

        list_inits = project.get_list_inits_after_filters_and_sorted(
            request.GET
        )
        [x.check_updates() for x in list_inits]

        inst = {
            "project_initiatives": [
                {
                    "initiative": initiative,
                    "addfields": initiative.addfields.all(),
                    "properties_fields": initiative.properties_fields.all(),
                    "metric_fields": initiative.metric_fields.all(),
                    "roles": initiative.get_community_roles(),
                    "files": initiative.files.all(),
                }
                for initiative in list_inits
            ]
        }
        s = ListInitiativeSerializer(instance=inst)

        return Response(s.data, 200)


class ListInitiativesFileView(ListInitiativesView):
    def get(self, request):
        project = get_project_by_id_or_active(request)
        list_inits = (
            project.initiatives.order_by("pk", "-date_registration")
            .distinct("pk")
            .all()
        )

        [x.check_updates() for x in list_inits]
        inst = {
            "project_initiatives": [
                {
                    "initiative": initiative,
                    "addfields": initiative.addfields.all(),
                    "properties_fields": initiative.properties_fields.all(),
                    "metric_fields": initiative.metric_fields.all(),
                    "roles": initiative.get_community_roles(),
                    "files": [],
                }
                for initiative in list_inits
            ]
        }
        s = ListInitiativeSerializer(instance=inst)
        url_file = s.create_excel(self.request.user, s.data)
        return Response({"url": url_file}, 200)


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
                metrics_user_stat[m] = 0
        for initiative in inits:
            user_initiatives.append(
                {
                    "initiative": initiative,
                    "addfields": initiative.addfields.all(),
                    "properties_fields": initiative.properties_fields.all(),
                    "metric_fields": initiative.metric_fields.all(),
                    "roles": initiative.get_community_roles(),
                    "files": initiative.files.all(),
                }
            )
            for m_obj in initiative.metric_fields.all():
                metric = m_obj.metric
                if metric in metrics_user_stat:
                    metrics_user_stat[m_obj.metric] += m_obj.value
            events += initiative.events.all()
        metrics_user_stat_format = []

        for metric, v in metrics_user_stat.items():
            metrics_user_stat_format.append({"metric": metric, "value": v})
        return {
            "user_initiatives": user_initiatives,
            "metrics_user_stat": metrics_user_stat_format,
            "events": events,
        }

    response_schema_dict = {
        "200": openapi.Response(
            description="Статистика пользователя в проекте",
            examples={
                "application/json": {
                    "user_initiatives": [
                        {
                            "initiative": {
                                "id": 1,
                                "project": 2,
                                "author": 1,
                                "name": "Восстановление дробильно-фрезерной машины и вагоноопракидывателя №2",
                                "current_state": "Низкая производительность машины и вагоноопракидывателя из-за износа",
                                "reasons": "Доведение аппаратов до проектного состояния позволит достичь проектных мощностей",
                                "description": "Восстановление существующих систем видеоконтроля за качеством очищенных вагонов в зданиях вагоноопрокидывателей № 1, 2, 3",
                                "date_start": "2023-01-15",
                                "date_end": "2023-08-01",
                                "date_registration": "2022-11-29",
                                "status": {
                                    "id": 5,
                                    "value": 0,
                                    "name": "L0",
                                    "settings_project": 2,
                                },
                            },
                            "properties_fields": [
                                {
                                    "id": 1,
                                    "title": {
                                        "id": 1,
                                        "title": "Подразделения",
                                        "initiative_activate": True,
                                    },
                                    "value": {
                                        "id": 1,
                                        "value": "КХП",
                                        "propertie": 1,
                                    },
                                },
                                {
                                    "id": 2,
                                    "title": {
                                        "id": 2,
                                        "title": "Программы",
                                        "initiative_activate": True,
                                    },
                                    "value": {
                                        "id": 4,
                                        "value": "ДРК",
                                        "propertie": 2,
                                    },
                                },
                            ],
                            "metric_fields": [
                                {
                                    "metric": {
                                        "id": 2,
                                        "title": "млн.руб.",
                                        "units": "бм",
                                        "initiative_activate": True,
                                    },
                                    "value": 440,
                                },
                                {
                                    "metric": {
                                        "id": 3,
                                        "title": "ШЕ",
                                        "units": "бм",
                                        "initiative_activate": True,
                                    },
                                    "value": 0,
                                },
                            ],
                            "addfields": [
                                {
                                    "id": 1,
                                    "value": "Снижение ручного труда",
                                    "title": {
                                        "id": 1,
                                        "title": "Качественный эффект",
                                        "type": "str",
                                    },
                                }
                            ],
                        }
                    ],
                    "events": [
                        {
                            "id": 1,
                            "initiative": 1,
                            "name": "Подготовка проектной документации",
                            "date_start": "2023-01-15",
                            "date_end": "2023-02-15",
                            "ready": False,
                        },
                        {
                            "id": 2,
                            "initiative": 1,
                            "name": "Проведение ремонтных работ",
                            "date_start": "2023-03-01",
                            "date_end": "2023-06-01",
                            "ready": False,
                        },
                        {
                            "id": 3,
                            "initiative": 1,
                            "name": "Выход на проектную мощность",
                            "date_start": "2023-06-10",
                            "date_end": "2023-08-01",
                            "ready": False,
                        },
                    ],
                    "metrics_user_stat": [
                        {"title": "млн.руб.", "value": 440},
                        {"title": "ШЕ", "value": 0},
                    ],
                }
            },
        ),
        "400": openapi.Response(
            description="Передан id несуществующего проекта",
            examples={
                "application/json": {"id": ["project pk = 1 not exist"]}
            },
        ),
        "401": openapi.Response(
            description="Токен идентификации не был передан",
            examples={
                "application/json": {
                    "detail": "Учетные данные не были предоставлены."
                }
            },
        ),
    }

    @swagger_auto_schema(
        operation_description="Статистика пользователя в проекте",
        responses=response_schema_dict,
        manual_parameters=[
            openapi.Parameter(
                name="id",
                in_=openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                description="ID проекта",
            )
        ],
    )
    def get(self, request):
        project = get_project_by_id_or_active(request)
        user = request.user
        list_inits = []
        user_inits = Initiatives.get_user_initiatievs(user, project)

        list_inits = project.get_list_inits_after_filters_and_sorted(
            request.GET, user_inits
        )
        [x.check_updates() for x in list_inits]

        s = UserPersonStatisticSerializer(
            instance=self._get_user_statistic(project, list_inits)
        )
        return Response(s.data, 200)


class RolesInitiativeView(views.APIView):
    permission_classes = [IsUserAuthorInitiativesOrAdminPermission]

    def get(self, request):
        id_init = request.GET.get("id", None)
        if not id_init or not id_init.isdigit():
            return Response({"msg": "id init not valid"}, 400)
        init: Initiatives = get_object_or_404(
            Initiatives, id=request.GET.get("id")
        )
        serializer = RolesUserInInitiativeSerializer(
            instance=init.user_roles.all(), many=True
        )
        return Response(serializer.data, 200)

    def post(self, request):
        id_init = request.GET.get("id", None)
        if not id_init or not id_init.isdigit():
            return Response({"msg": "id init not valid"}, 400)
        init: Initiatives = get_object_or_404(
            Initiatives, id=request.GET.get("id")
        )
        self.check_object_permissions(self.request, init)
        serializer = RolesUserInInitiativeSerializer(
            data=request.data,
            context={
                "init": init,
                "items_not_delete": list(),
            },
            many=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        RolesUserInInitiativeSerializer.check_delete_person(serializer.context)
        return Response(serializer.data)


# ++++++++++++++++++++++РИСКИ+++++++++++++++++++++++++++
class CreateRiskView(views.APIView):
    permission_classes = [IsUserUpdateInitiativesOrAdminPermission]
    response_schema_dict = {
        "200": openapi.Response(
            description="Название риска в рамках инициативы уникально.",
            examples={
                "application/json": {
                    "risk": {
                        "name": "Название нового риска",
                        "initiative_id": 1,
                        "author_id": 1,
                    },
                    "addfields": [
                        {"id": 1, "value": "12"},
                        {"id": 2, "value": ""},
                    ],
                }
            },
        ),
        "400": openapi.Response(
            description="Название риска в рамках инициативы уникально.",
            examples={
                "application/json": {
                    "risk": {"name": ["Имя уже используется"]}
                }
            },
        ),
        "401": openapi.Response(
            description="Токен идентификации не был передан",
            examples={
                "application/json": {
                    "detail": "Учетные данные не были предоставлены."
                }
            },
        ),
        "404": openapi.Response(
            description="Если передать несуществующий id инициативы",
            examples={"application/json": {"detail": "Страница не найдена."}},
        ),
    }

    @swagger_auto_schema(
        operation_description="Создать риск",
        responses=response_schema_dict,
        request_body=RiskInfoSerializer,
    )
    def post(self, request):
        initiative_id = request.data.get("risk", {}).get("initiative", None)
        init = get_object_or_404(Initiatives, id=initiative_id)
        self.check_object_permissions(self.request, init)
        s: RiskInfoSerializer = RiskInfoSerializer(
            data=request.data,
            context={
                "initiative": init,
                "user": request.user,
            },
        )
        s.is_valid(raise_exception=True)
        s.create_or_update(s.data)
        return Response(s.data, 200)


class InfoRiskView(views.APIView):
    response_schema_dict = {
        "200": openapi.Response(
            description="Если передать существующий id риска",
            examples={
                "application/json": {
                    "risk": {
                        "id": 1,
                        "name": "Название риска 1",
                        "initiative": 1,
                    },
                    "addfields": [
                        {
                            "id": 1,
                            "value": "Описание риска 1",
                            "title": {
                                "id": 1,
                                "title": "Описание риска",
                                "type": "str",
                                "settings_project": 2,
                            },
                        },
                        {
                            "id": 2,
                            "value": "Митигация риска 1",
                            "title": {
                                "id": 2,
                                "title": "Митигация риска",
                                "type": "str",
                                "settings_project": 2,
                            },
                        },
                    ],
                }
            },
        ),
        "400": openapi.Response(
            description="Передан id несуществующей риска",
            examples={"application/json": {"detail": "Страница не найдена."}},
        ),
        "401": openapi.Response(
            description="Токен идентификации не был передан",
            examples={
                "application/json": {
                    "detail": "Учетные данные не были предоставлены."
                }
            },
        ),
    }

    @swagger_auto_schema(
        operation_description="Информация о риске",
        responses=response_schema_dict,
        manual_parameters=[
            openapi.Parameter(
                name="id",
                in_=openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                description="ID риска",
            )
        ],
    )
    def get(self, request):
        id_risk = request.GET.get("id", None)
        risc_obj = get_object_or_404(Risks, id=id_risk)
        risc_obj.check_updates()
        s = RiskInfoSerializer(
            instance={
                "risk": risc_obj,
                "addfields": risc_obj.addfields.all(),
            }
        )
        return Response(s.data, 200)


class ListRiskView(views.APIView):
    """
    Выдать список инициатив проекта
    """

    response_schema_dict = {
        "200": openapi.Response(
            description="Если передать существующий id инициативы",
            examples={
                "application/json": {
                    "initiative_risks": [
                        {
                            "risk": {
                                "id": 1,
                                "name": "Название риска 1",
                                "initiative": 1,
                            },
                            "addfields": [
                                {
                                    "id": 1,
                                    "value": "Описание риска 1",
                                    "title": {
                                        "id": 1,
                                        "title": "Описание риска",
                                        "type": "str",
                                        "settings_project": 2,
                                    },
                                },
                                {
                                    "id": 2,
                                    "value": "Митигация риска 1",
                                    "title": {
                                        "id": 2,
                                        "title": "Митигация риска",
                                        "type": "str",
                                        "settings_project": 2,
                                    },
                                },
                            ],
                        }
                    ]
                }
            },
        ),
        "400": openapi.Response(
            description="Передан id несуществующей инициативы",
            examples={"application/json": {"detail": "Страница не найдена."}},
        ),
        "401": openapi.Response(
            description="Токен идентификации не был передан",
            examples={
                "application/json": {
                    "detail": "Учетные данные не были предоставлены."
                }
            },
        ),
    }

    @swagger_auto_schema(
        operation_description="Список рисков инициативы",
        responses=response_schema_dict,
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
        id = request.GET.get("id", None)
        initiative = get_object_or_404(Initiatives, id=id)
        risks = initiative.risks.all()
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


class DeleteRiskView(views.APIView):
    permission_classes = [IsUserUpdateInitiativesOrAdminPermission]
    response_schema_dict = {
        "200": openapi.Response(
            description="Удаление риска",
            examples={"application/json": {"msg": "risk delete"}},
        ),
        "400": openapi.Response(
            description="Передан id несуществующего риска",
            examples={"application/json": {"detail": "Страница не найдена."}},
        ),
        "401": openapi.Response(
            description="Токен идентификации не был передан",
            examples={
                "application/json": {
                    "detail": "Учетные данные не были предоставлены."
                }
            },
        ),
    }

    @swagger_auto_schema(
        operation_description="Удалить риск",
        responses=response_schema_dict,
        request_body=DeleteRiskSerializer,
    )
    def delete(self, request):
        s = DeleteRiskSerializer(
            data=request.data,
            context={"user": request.user},
        )
        s.is_valid(raise_exception=True)
        id_risk = request.data.get("id")
        risc_obj = get_object_or_404(Risks, id=id_risk)
        self.check_object_permissions(self.request, risc_obj.initiative)
        risc_obj.delete()
        return Response({"msg": "risk delete"}, 200)


# ++++++++++++++++++++++МЕРОПРИЯТИЯ+++++++++++++++++++++++++++
class InfoEventView(views.APIView):
    response_schema_dict = {
        "200": openapi.Response(
            description="Информация о мероприятии",
            examples={
                "application/json": {
                    "event": {
                        "id": 1,
                        "initiative": 1,
                        "name": "Подготовка проектной документации",
                        "date_start": "2023-01-15",
                        "date_end": "2023-02-15",
                        "ready": False,
                    },
                    "event_status": "Запланировано",
                    "metric_fields": [
                        {
                            "metric": {
                                "id": 2,
                                "title": "млн.руб.",
                                "units": "бм",
                                "initiative_activate": True,
                            },
                            "value": 70,
                        },
                        {
                            "metric": {
                                "id": 3,
                                "title": "ШЕ",
                                "units": "бм",
                                "initiative_activate": True,
                            },
                            "value": 0,
                        },
                    ],
                    "addfields": [],
                }
            },
        ),
        "400": openapi.Response(
            description="Передан id несуществующего мероприятия",
            examples={"application/json": {"detail": "Страница не найдена."}},
        ),
        "401": openapi.Response(
            description="Токен идентификации не был передан",
            examples={
                "application/json": {
                    "detail": "Учетные данные не были предоставлены."
                }
            },
        ),
    }

    @swagger_auto_schema(
        operation_description="Информация о мероприятии",
        responses=response_schema_dict,
        manual_parameters=[
            openapi.Parameter(
                name="id",
                in_=openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                description="ID мероприятия",
            )
        ],
    )
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
    permission_classes = [IsUserUpdateInitiativesOrAdminPermission]

    @swagger_auto_schema(
        operation_description="Создать мероприятие",
        request_body=EventSerializer,
    )
    def post(self, request):
        initiative_id = request.data.get("event", {}).get("initiative", None)
        initiative = get_object_or_404(Initiatives, id=initiative_id)
        self.check_object_permissions(self.request, initiative)
        data = request.data

        s: EventSerializer = EventSerializer(
            data=data, context={"initiative": initiative, "user": request.user}
        )
        s.is_valid(raise_exception=True)
        data = s.data
        s.create_or_update(s.data)
        return Response(s.data, 201)


class DeleteEventView(views.APIView):
    permission_classes = [IsUserUpdateInitiativesOrAdminPermission]

    @swagger_auto_schema(
        operation_description="Удаление мероприятия",
        manual_parameters=[
            openapi.Parameter(
                name="id",
                in_=openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                description="ID мероприятия",
            )
        ],
    )
    def delete(self, request):
        id_event = request.GET.get("id", None)
        if not id_event or not id_event.isdigit():
            return Response("get id event", 404)
        ev = get_object_or_404(Events, id=id_event)
        self.check_object_permissions(self.request, ev.initiative)
        ev.delete_node(id_event)
        return Response({"msg": "Мероприятие удалено"}, 204)


class ListEventView(views.APIView):
    response_schema_dict = {
        "200": openapi.Response(
            description="Передан id несуществующей инициативы",
            examples={
                "application/json": {
                    "initiative_events": [
                        {
                            "event": {
                                "id": 1,
                                "initiative": 1,
                                "name": "Подготовка проектной документации",
                                "date_start": "2023-01-15",
                                "date_end": "2023-02-15",
                                "ready": False,
                            },
                            "event_status": "Запланировано",
                            "metric_fields": [
                                {
                                    "metric": {
                                        "id": 2,
                                        "title": "млн.руб.",
                                        "units": "бм",
                                        "initiative_activate": True,
                                    },
                                    "value": 440,
                                },
                                {
                                    "metric": {
                                        "id": 3,
                                        "title": "ШЕ",
                                        "units": "бм",
                                        "initiative_activate": True,
                                    },
                                    "value": 0,
                                },
                            ],
                            "addfields": [],
                        },
                        {
                            "event": {
                                "id": 2,
                                "initiative": 1,
                                "name": "Проведение ремонтных работ",
                                "date_start": "2023-03-01",
                                "date_end": "2023-06-01",
                                "ready": False,
                            },
                            "event_status": "Запланировано",
                            "metric_fields": [
                                {
                                    "metric": {
                                        "id": 2,
                                        "title": "млн.руб.",
                                        "units": "бм",
                                        "initiative_activate": True,
                                    },
                                    "value": 440,
                                },
                                {
                                    "metric": {
                                        "id": 3,
                                        "title": "ШЕ",
                                        "units": "бм",
                                        "initiative_activate": True,
                                    },
                                    "value": 0,
                                },
                            ],
                            "addfields": [],
                        },
                        {
                            "event": {
                                "id": 3,
                                "initiative": 1,
                                "name": "Выход на проектную мощность",
                                "date_start": "2023-06-10",
                                "date_end": "2023-08-01",
                                "ready": False,
                            },
                            "event_status": "Запланировано",
                            "metric_fields": [
                                {
                                    "metric": {
                                        "id": 2,
                                        "title": "млн.руб.",
                                        "units": "бм",
                                        "initiative_activate": True,
                                    },
                                    "value": 440,
                                },
                                {
                                    "metric": {
                                        "id": 3,
                                        "title": "ШЕ",
                                        "units": "бм",
                                        "initiative_activate": True,
                                    },
                                    "value": 0,
                                },
                            ],
                            "addfields": [],
                        },
                    ]
                }
            },
        ),
        "400": openapi.Response(
            description="Передан id несуществующей инициативы",
            examples={"application/json": {"detail": "Страница не найдена."}},
        ),
        "401": openapi.Response(
            description="Токен идентификации не был передан",
            examples={
                "application/json": {
                    "detail": "Учетные данные не были предоставлены."
                }
            },
        ),
    }

    @swagger_auto_schema(
        operation_description="Список мероприятий инициативы",
        responses=response_schema_dict,
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
        id = request.GET.get("id", None)
        initiative = get_object_or_404(Initiatives, id=id)
        events = initiative.events.all()
        [x.check_updates() for x in events]
        inst = {
            "initiative_events": [
                {
                    "event": event,
                    "event_status": event.get_status(event),
                    "metric_fields": event.metric_fields.all(),
                    "addfields": event.addfields.all(),
                }
                for event in initiative.events.all()
            ]
        }

        s = ListEventSerializer(instance=inst)
        return Response(s.data, 200)


from rest_framework import status, viewsets
from rest_framework.permissions import IsAdminUser, IsAuthenticatedOrReadOnly
from .permissions import IsAdminOrReadOnlyPermission
from .serializers import (
    SettingsFilesInitiativeReadSerializer,
    InitiativesFilesSerializer,
)
from .models import InitiativesFiles
from rest_framework import mixins

from rest_framework.decorators import action


class InitiativesSettingsFilesViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAdminOrReadOnlyPermission]
    pagination_class = None

    def get_queryset(self):
        prject = get_object_or_404(Project, id=self.kwargs.get("project_id"))
        settings_project = prject.settings_initiatives.first()
        return SettingsFilesInitiative.objects.filter(
            settings_project=settings_project
        ).all()

    def get_serializer_class(self):
        if self.action in ["list"]:
            return SettingsFilesInitiativeReadSerializer
        return SettingsFilesInitiativeSerializer

    def list(self, request, project_id):
        prject = get_object_or_404(Project, id=self.kwargs.get("project_id"))
        settings_project = prject.settings_initiatives.first()
        data = {}
        for settings_status in SettingsStatusInitiative.objects.filter(
            settings_project=settings_project
        ).all():
            data[settings_status] = []

        queryset = self.get_queryset()

        for item in queryset:
            if item.status not in data:
                data[item.status] = []
            data[item.status].append(item)

        res = []
        for key, val in data.items():
            res.append({"status": key, "settings_file": val})
        serializer = self.get_serializer(res, many=True)
        return Response(serializer.data)

    def create(self, request, project_id):
        prject = get_object_or_404(Project, id=self.kwargs.get("project_id"))
        settings_project = prject.settings_initiatives.first()
        serializer = self.get_serializer(
            data=request.data,
            many=True,
            context={"settings_project": settings_project},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        SettingsFilesInitiative.objects.filter(
            settings_project=settings_project
        ).exclude(id__in=[x.get("id") for x in serializer.data]).delete()
        return Response(serializer.data, status=status.HTTP_200_OK)


class InitiativeFile(views.APIView):
    permission_classes = [IsUserUpdateInitiativesOrAdminPermission]

    def get(self, request):
        id_init = request.GET.get("id", None)
        if not id_init or not id_init.isdigit():
            return Response("get id id_init", 404)
        init = get_object_or_404(Initiatives, id=id_init)
        s = InfoInitiativesFilesSerializer(
            instance=init.get_files(), many=True
        )
        return Response(s.data, 200)

    def delete(self, request):
        id_file = request.GET.get("id", None)
        if not id_file or not id_file.isdigit():
            return Response("get id file", 404)
        file = get_object_or_404(InitiativesFiles, id=id_file)
        self.check_object_permissions(self.request, file.initiative)
        file.delete()
        return Response("Файл удален", 200)

    def post(self, request):
        id_init = request.GET.get("id", None)
        if not id_init or not id_init.isdigit():
            return Response("get id file", 404)
        file = self.request.FILES.get("file")
        if not file:
            return Response("get file", 404)
        init_file = get_object_or_404(InitiativesFiles, id=id_init)
        self.check_object_permissions(self.request, init_file.initiative)
        init_file.file = file
        init_file.file_name = str(file)
        file = init_file.save()
        file_obj = InitiativesFilesSerializer(instance=file)
        return Response(file_obj.data, 200)
