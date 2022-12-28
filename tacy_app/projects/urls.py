from django.contrib import admin
from django.urls import include, path
from projects import views

app_name = "projects"

urlpatterns = [
    path("create/", views.CreateProjectView.as_view()),
    path("delete/", views.DeleteProjectView.as_view()),
    path("community/", views.UpdateCommunityProjectView.as_view()),
    path("community/bosses/", views.BossesProjectView.as_view()),
    path("info/", views.InfoProjectView.as_view()),
    path("list/", views.GetProjectListView.as_view()),
]
