from django.shortcuts import render
from rest_framework import status, views
from projects.models import Project
from .models import GraficsProject
from .serializers import (
    GraficsProjectSerializer,
    GraficsProjectInfoSerializer,
    PropertieSerializer,
)
from rest_framework.response import Response
from django.shortcuts import get_object_or_404, render

# Create your views here.
class UpdateGraficsProjectView(views.APIView):
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

    def get(self, request, format=None):
        project = Project.get_project_by_id(request.GET.get("id", None))
        data = {"grafics": GraficsProject.get_by_project(project)}
        print(data)
        serializer = GraficsProjectInfoSerializer(
            instance=data,
        )
        return Response(serializer.data, 200)


class StatisticMetricsView(views.APIView):
    def get(self, request, format=None):
        project = get_object_or_404(Project, id=request.GET.get("id", None))
        stat = GraficsProject.get_statistic_metrics_by_project(project)

        return Response(stat, 200)


class StatisticProjectView(views.APIView):
    def get(self, request, format=None):
        project = get_object_or_404(Project, id=request.GET.get("id", None))

        stat = GraficsProject.get_statistic_by_project(project)
        import pprint

        pprint.pprint(stat)
        return Response(stat, 200)
