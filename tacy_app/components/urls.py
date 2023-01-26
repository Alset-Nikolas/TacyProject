from django.urls import include, path
from . import views
from rest_framework.routers import DefaultRouter

app_name = "components"

v1_router = DefaultRouter()
v1_router.register(
    r"settings/file/(?P<project_id>\d+)",
    views.InitiativesSettingsFilesViewSet,
    basename="settings_files",
)

urlpatterns = [
    path("settings/", views.UpdateSettingsInitiativeView.as_view()),
    path("initiative/create/", views.CreateInitiativeView.as_view()),
    path("initiative/file/", views.InitiativeFile.as_view()),
    path("initiative/delete/", views.DeleteInitiativeView.as_view()),
    path("initiative/info/", views.InfoInitiativeView.as_view()),
    path("initiative/info/list/", views.ListInitiativesView.as_view()),
    path(
        "initiative/info/list/file/", views.ListInitiativesFileView.as_view()
    ),
    path(
        "initiative/user/statistics/",
        views.UserStatisticsInitiativesView.as_view(),
    ),
    path(
        "initiative/role/",
        views.RolesInitiativeView.as_view(),
    ),
    path("risk/create/", views.CreateRiskView.as_view()),
    path("risk/info/", views.InfoRiskView.as_view()),
    path("risk/delete/", views.DeleteRiskView.as_view()),
    path("risk/info/list/", views.ListRiskView.as_view()),
    path("event/create/", views.CreateEventView.as_view()),
    path("event/delete/", views.DeleteEventView.as_view()),
    path("event/info/", views.InfoEventView.as_view()),
    path("event/info/list/", views.ListEventView.as_view()),
    path("", include(v1_router.urls)),
]
