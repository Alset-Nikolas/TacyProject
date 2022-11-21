from django.contrib import admin
from django.urls import include, path

from . import views

app_name = "users"
urlpatterns = [
    path("login/", views.LoginView.as_view()),
    path("info/", views.InfoView.as_view()),
    path("logout/", views.LogoutView.as_view()),
    path(
        "reset-password/",
        include("django_rest_passwordreset.urls", namespace="password_reset"),
    ),
]
