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
    RolesProject,
    RolesProject,
    ProjectFiles,
    СommunityProject,
    PropertiesСommunityProject,
)
from .serializers import (
    InfoProjectSerializer,
    ListProjecttSerializer,
    UpdateCommunityProjectSerializer,
    UserProjectIdSerializer,
    ProjectFilesSerializer,
    ProjectFilesIdSerializer,
)
from components.models import SettingsComponents
from users.serializers import UserSerializer
from components.models import SettingsStatusInitiative
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .permissions import IsAdminOrReadOnlyPermission

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

    response_schema_dict = {
        "200": openapi.Response(
            description="Проект создан (обновлен)",
            examples={
                "application/json": {"msg": "Проект обновился", "id": 4}
            },
        ),
        "400 (v1)": openapi.Response(
            description="Дата конца проекта > дата начала",
            examples={
                "application/json": {
                    "date_start <= date_end": [
                        "date_start_project <= date_end"
                    ],
                    "msg_er": [
                        "Дата конца проекта не может быть раньше начала."
                    ],
                }
            },
        ),
        "400 (v2)": openapi.Response(
            description="Промежуточные даты не могут вылезать за промежуток активности проекта",
            examples={
                "application/json": {
                    "intermediate_dates": [
                        "date_start <= intermediate_dates <= date_end"
                    ],
                    "msg_er": [
                        "Промежуточные даты должны начинаться не раньше 'Даты создания проекта' и не позже 'Даты конца проекта'"
                    ],
                }
            },
        ),
        "400 (v3)": openapi.Response(
            description="Этапы проекта не могут вылезать за промежуток активности проекта",
            examples={
                "application/json": {
                    "stages": [
                        "date_start_project <= stages_dates <= date_end_project"
                    ],
                    "msg_er": [
                        "Этапы проекта не могут начинаться раньше 'Даты создания проекта' и закончится позже 'Даты конца проекта'"
                    ],
                }
            },
        ),
        "400 (v4)": openapi.Response(
            description="Название проектов - уникальны.",
            examples={
                "application/json": {
                    "name": ["name project already exist"],
                    "msg_er": ["Такое имя проекта уже кем-то используется."],
                }
            },
        ),
        "400 (v5)": openapi.Response(
            description="Если передать id>0 - проект должен существовать",
            examples={
                "application/json": {
                    "id": "id project not exist",
                    "msg_er": "Проект с таким id не найден",
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
    }
    permission_classes = [IsAdminOrReadOnlyPermission]

    @swagger_auto_schema(
        operation_description="Создание (обновление) проекта. Если id>0 - то обновление, иначе создание нового проекта.",
        responses=response_schema_dict,
        manual_parameters=[],
        request_body=serializers.CreateProjectSerializer,
    )
    def post(self, request, format=None):
        serializer_project = serializers.CreateProjectSerializer(
            data=request.data,
            context={
                "request": request,
            },
        )
        serializer_project.is_valid(raise_exception=True)
        validated_data: tp.OrderedDict = serializer_project.validated_data
        project: Project = serializer_project.create_or_update(validated_data)
        self.check_object_permissions(self.request, project)
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
        properties = PropertiesProject.update_properties_for_project(
            project,
            validated_data["properties"],
        )
        RolesProject.create_or_update(
            project,
            validated_data["roles"],
        )

        settings_project = SettingsComponents.create(project.id)
        SettingsStatusInitiative.generate_defauld_status(settings_project)
        data = serializer_project.data
        data["id"] = project.id
        community_item = СommunityProject.create_or_update_user_in_community(
            project=project,
            user=self.request.user,
            is_create=True,
            is_author=True,
        )
        PropertiesСommunityProject.create_default_properties_user_in_community(
            community_item, properties
        )
        return Response(
            data,
            status=status.HTTP_200_OK,
        )


class GetProjectListView(views.APIView):
    """
    Выдать список проектов пользователя
    """

    response_schema_dict = {
        "200": openapi.Response(
            description="Полная информация об проекте по id.",
            examples={
                "application/json": {
                    "items": [
                        {"id": 2, "name": "Ландшафт долностей НЛМК"},
                        {"id": 3, "name": "g"},
                    ]
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
    }

    @swagger_auto_schema(
        operation_description="Список проектов пользовтеля.",
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

    permission_classes = [IsAdminOrReadOnlyPermission]
    response_schema_dict = {
        "200": openapi.Response(
            description="Список людей, с правами согласования инициативы.",
            examples={
                "application/json": {
                    "community_info": [
                        {
                            "user": {
                                "id": 1,
                                "first_name": "z",
                                "last_name": "z",
                                "second_name": "z",
                                "email": "z@mail.ru",
                                "phone": "1",
                            },
                            "role_user": {"id": 5, "name": "Наблюдать"},
                            "rights_user": [
                                {"id": 4, "name": "Создать инициативу"}
                            ],
                            "properties": [
                                {"title": {"id": 1}, "values": []},
                                {"title": {"id": 2}, "values": []},
                            ],
                        },
                    ]
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
        manual_parameters=[
            openapi.Parameter(
                name="id",
                in_=openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                description="ID проекта",
            )
        ],
    )
    def get(self, request, format=None):
        project: Project = get_project_by_id_or_active(request)
        project.update_community()
        s: UpdateCommunityProjectSerializer = UpdateCommunityProjectSerializer(
            instance=project
        )
        return Response(
            s.data,
            status=status.HTTP_200_OK,
        )

    @swagger_auto_schema(
        operation_description="Обновить команду проекта.",
        request_body=UpdateCommunityProjectSerializer,
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
    def post(self, request, format=None):
        project: Project = get_project_by_id_or_active(request)
        s: UpdateCommunityProjectSerializer = UpdateCommunityProjectSerializer(
            data=request.data, context={"project": project}
        )
        self.check_object_permissions(self.request, project)
        s.is_valid(raise_exception=True)
        s.create_community(request.data)

        return Response(
            {
                "code": 200,
                "msg": "Команда проекта обновлена",
                "community": s.data,
            },
            status=status.HTTP_200_OK,
        )


class InfoProjectView(views.APIView):
    """
    GET:
        Выдать информацию об проекте ->  страничка: 'Информация о проекте'
    """

    response_schema_dict = {
        "200": openapi.Response(
            description="Полная информация об проекте по id.",
            examples={
                "application/json": {
                    "id": 3,
                    "name": "g",
                    "date_start": "2022-12-13",
                    "date_end": "2022-12-13",
                    "purpose": "Мои цели на этот проект",
                    "tasks": "Мои задачи на этот проект",
                    "description": "Мои цели на этот проект",
                    "intermediate_dates": [],
                    "properties": [],
                    "roles": [],
                    "rights": [],
                    "metrics": [],
                    "stages": [],
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
        "400 (v2)": openapi.Response(
            description="Проекы разделены на сообщества, нельзя запросить сторонний проект",
            examples={
                "application/json": {
                    "id": {
                        "id": "user 7 not working in project pk=3",
                        "msg_er": "В этот проект Вас не приглашали",
                    }
                }
            },
        ),
    }

    @swagger_auto_schema(
        operation_description="Информация о проекте",
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
    def get(self, request, format=None):
        project = get_project_by_id_or_active(request)
        project_serializer = InfoProjectSerializer(instance=project)
        return Response(
            project_serializer.data,
            status=status.HTTP_200_OK,
        )


class DeleteProjectView(views.APIView):
    permission_classes = [IsAdminOrReadOnlyPermission]
    response_schema_dict = {
        "200": openapi.Response(
            description="Проект удален",
            examples={"application/json": {"msg": "Проект удален"}},
        ),
        "400": openapi.Response(
            description="Токен идентификации не был передан",
            examples={
                "application/json": {"id": ["project pk = 0 not exist"]}
            },
        ),
        "400 (v2)": openapi.Response(
            description="Проекы разделены на сообщества, нельзя запросить сторонний проект",
            examples={
                "application/json": {
                    "id": {
                        "id": "user 7 not working in project pk=3",
                        "msg_er": "В этот проект Вас не приглашали",
                    }
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
    }

    @swagger_auto_schema(
        operation_description="Удаление проекта.",
        responses=response_schema_dict,
        manual_parameters=[],
        request_body=UserProjectIdSerializer,
    )
    def delete_dir_project(self, project_id):
        path_dir = f"files/project/{project_id}"

    def delete(self, request):
        id_serializer = UserProjectIdSerializer(
            data=self.request.data, context={"user": request.user}
        )
        id_serializer.is_valid(raise_exception=True)
        project = get_object_or_404(
            Project, id=id_serializer.validated_data["id"]
        )
        self.check_object_permissions(self.request, project)

        project.delete()
        return Response({"msg": "Проект удален"}, status=status.HTTP_200_OK)


class FileProjectView(views.APIView):
    permission_classes = [IsAdminOrReadOnlyPermission]

    def post(self, request):
        project = get_object_or_404(Project, id=self.request.GET.get("id"))
        total_files = self.request.data.get("total")
        self.check_object_permissions(self.request, project)
        if total_files:
            for number in range(int(total_files)):
                file_key = "file" + str(number)
                file = self.request.FILES.get(file_key)
                ProjectFiles.add_file(project, file)
            s = ProjectFilesSerializer(instance=project.files.all(), many=True)
            return Response(s.data, status=status.HTTP_201_CREATED)
        return Response(
            {"msg": "не передали файл для сохранения"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def get(self, request):
        project = get_object_or_404(Project, id=self.request.GET.get("id"))
        s = ProjectFilesSerializer(instance=project.files.all(), many=True)
        return Response(s.data, status=status.HTTP_200_OK)

    def delete(self, request):
        project = get_object_or_404(Project, id=self.request.GET.get("id"))
        s = ProjectFilesIdSerializer(
            data=self.request.data, many=True, context={"project": project}
        )
        self.check_object_permissions(self.request, project)
        s.is_valid(raise_exception=True)
        ProjectFiles.objects.filter(
            id__in=[x.get("id") for x in s.data]
        ).delete()
        return Response({"msg": "Файлы удалены"}, status=status.HTTP_200_OK)
