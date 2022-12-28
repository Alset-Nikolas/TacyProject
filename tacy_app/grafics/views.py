from django.shortcuts import render
from rest_framework import status, views
from projects.models import Project
from .models import GraficsProject
from .serializers import GraficsProjectSerializer
from rest_framework.response import Response
from django.shortcuts import get_object_or_404, render
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

# Create your views here.
class UpdateGraficsProjectView(views.APIView):
    @swagger_auto_schema(
        operation_description="Обновить настройки графиков",
        request_body=GraficsProjectSerializer,
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

        project = Project.get_project_by_id(request.GET.get("id", None))
        serializer = GraficsProjectSerializer(
            data=self.request.data, context={"project": project}
        )
        serializer.is_valid(raise_exception=True)
        GraficsProject.create_or_update_grafics_in_project(
            project, request.data.get("grafics")
        )
        return Response(
            {"code": 200, "msg": "Параметры графиков обновлены"},
            status=status.HTTP_200_OK,
        )

    @swagger_auto_schema(
        operation_description="Посмотреть настройки графиков",
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
        id = request.GET.get("id", None)
        if not id or not id.isdigit():
            return Response({"msg": "id project not valid"}, 400)

        project = Project.get_project_by_id(id)
        data = {"grafics": GraficsProject.get_by_project(project)}
        serializer = GraficsProjectSerializer(instance=data)
        return Response(serializer.data, 200)


class StatisticMetricsView(views.APIView):
    @swagger_auto_schema(
        operation_description="Статистика по проекту",
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
        id = request.GET.get("id", None)
        if not id or not id.isdigit():
            return Response({"msg": "id project not valid"}, 400)
        project = get_object_or_404(Project, id=id)
        stat = GraficsProject.get_statistic_metrics_by_project(project)
        return Response(stat, 200)


class StatisticMetricsUserView(views.APIView):
    @swagger_auto_schema(
        operation_description="Персональная статистика в проекте",
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
        id = request.GET.get("id", None)
        if not id or not id.isdigit():
            return Response({"msg": "id project not valid"}, 400)
        project = get_object_or_404(Project, id=id)
        user = request.user
        stat = GraficsProject.get_statistic_user(user, project)
        return Response(stat, 200)
