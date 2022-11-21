import typing as tp

from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404, render
from rest_framework import status, views
from rest_framework.response import Response

from . import serializers
from .models import (
    IntermediateDateProject,
    MetricsProject,
    Project,
    ProjectStages,
    PropertiesProject,
    RightsUSerInProject,
    RolesUserInProject,
)
from .serializers import (
    InfoProjectSerializer,
    ListProjecttSerializer,
    UpdateCommunityProjectSerializer,
    UserProjectIdSerializer,
)
from components.models import SettingsComponents
from users.serializers import UserSerializer
from components.models import SettingsStatusInitiative

User = get_user_model()


def get_project_by_id_or_active(request) -> tp.Optional[Project]:
    """
    Выбор проекту:
        если есть параметр в запроме то по нему
        иначе - активный проект у пользователя
    """
    user: User = request.user
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


class CreateProjectView(views.APIView):
    """
    Создание/Обновление проекта
    """

    def post(self, request, format=None):
        serializer_project = serializers.CreateProjectSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer_project.is_valid(raise_exception=True)
        serializer_project.is_valid(raise_exception=True)
        validated_data: tp.OrderedDict = serializer_project.validated_data
        project: Project = serializer_project.create_or_update(validated_data)

        IntermediateDateProject.create_or_update_intermediate_dates_for_project(
            project,
            validated_data["intermediate_dates"],
        )
        ProjectStages.create_or_update_stages_project(
            project,
            validated_data["stages"],
        )
        MetricsProject.create_metrics_name_for_project(
            project,
            validated_data["metrics"],
        )
        PropertiesProject.update_properties_for_project(
            project,
            validated_data["properties"],
        )
        RolesUserInProject.create_default(
            project,
        )
        RightsUSerInProject.create_default(
            project,
        )
        settings_project = SettingsComponents.create(project.id)
        SettingsStatusInitiative.generate_defauld_status(settings_project)
        return Response(
            {"code": 200, "msg": "Проект обновился", "id": project.id},
            status=status.HTTP_200_OK,
        )


class GetProjectListView(views.APIView):
    """
    Выдать список проектов пользователя
    """

    def get(self, request, form=None):
        user: User = request.user
        projects = Project.get_user_projects(user)
        s = ListProjecttSerializer(instance={"items": projects})
        return Response(s.data, status.HTTP_200_OK)


class UpdateCommunityProjectView(views.APIView):
    """
    GET:
        Информация о сообществе -> страничка: 'Команда проекта'
    POST:
        Обновить информацию о сообществе -> страничка: 'Команда проекта'
    """

    def get(self, request, format=None):
        project: Project = get_project_by_id_or_active(request)
        s: UpdateCommunityProjectSerializer = UpdateCommunityProjectSerializer(
            instance=project
        )
        return Response(
            s.data,
            status=status.HTTP_200_OK,
        )

    def post(self, request, format=None):
        project: Project = get_project_by_id_or_active(request)
        s: UpdateCommunityProjectSerializer = UpdateCommunityProjectSerializer(
            data=request.data, context={"project": project}
        )
        s.is_valid(raise_exception=True)
        s.create_community(request.data)
        return Response(
            {
                "code": 200,
                "msg": "Команда проекта обновлена",
                "community": s.validated_data,
            },
            status=status.HTTP_200_OK,
        )


class InfoProjectView(views.APIView):
    """
    GET:
        Выдать информацию об проекте ->  страничка: 'Информация о проекте'
    """

    def get(self, request, format=None):
        project = get_project_by_id_or_active(request)
        project_serializer = InfoProjectSerializer(instance=project)
        return Response(
            project_serializer.data,
            status=status.HTTP_200_OK,
        )


class ChangeProjectView(views.APIView):
    """
    Ручка по смене проекта у пользователя
    """

    def post(self, request, format=None):
        user = request.user
        serializer = UserProjectIdSerializer(
            data=self.request.data, context={"user": user}
        )
        serializer.is_valid(raise_exception=True)
        project = Project.get_project_by_id(serializer.validated_data["id"])
        user.project_active = project
        user.save()
        return Response(
            {"code": 200, "msg": "Активный проект поменялся"},
            status=status.HTTP_200_OK,
        )


class DeleteProjectView(views.APIView):
    def delete(self, request):
        id_serializer = UserProjectIdSerializer(
            data=self.request.data, context={"user": request.user}
        )
        id_serializer.is_valid(raise_exception=True)
        project = get_object_or_404(
            Project, id=id_serializer.validated_data["id"]
        )
        project.delete()
        return Response(
            {"code": 200, "msg": "Проект удален"}, status=status.HTTP_200_OK
        )


class BossesProjectView(views.APIView):
    def get(self, request):
        project: Project = get_object_or_404(Project, id=request.GET.get("id"))
        s = UserSerializer(
            instance=Project.get_bosses_in_project(project), many=True
        )
        return Response(
            s.data,
            status=status.HTTP_200_OK,
        )
