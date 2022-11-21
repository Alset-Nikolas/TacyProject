from django.contrib import admin
from django.urls import include, path
from . import views

app_name = "grafics"

urlpatterns = [
    path("settings/", views.UpdateGraficsProjectView.as_view()),
    path("statistic/metrics/", views.StatisticMetricsView.as_view()),
    path("statistic/project/", views.StatisticProjectView.as_view()),
]
