from django.contrib import admin
from django.urls import include, path
from . import views

app_name = "components"

urlpatterns = [
    path("settings/", views.UpdateSettingsInitiativeView.as_view()),
    path("initiative/create/", views.CreateInitiativeView.as_view()),
    path("initiative/info/", views.InfoInitiativeView.as_view()),
    path("initiative/info/list/", views.ListInitiativesView.as_view()),
    path(
        "initiative/info/list/user/", views.ListUserInitiativesView.as_view()
    ),
    path("risk/create/", views.CreateRiskView.as_view()),
    path("risk/info/", views.InfoRiskView.as_view()),
    path("risk/delete/", views.DeleteRiskView.as_view()),
    path("risk/info/list/", views.ListRiskView.as_view()),
    path("event/create/", views.CreateEventView.as_view()),
    path("event/delete/", views.DeleteEventView.as_view()),
    path("event/info/", views.InfoEventView.as_view()),
    path("event/info/list/", views.ListEventView.as_view()),
]
