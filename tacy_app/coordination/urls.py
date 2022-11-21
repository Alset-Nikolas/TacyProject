from django.contrib import admin
from django.urls import include, path
from . import views

app_name = "coordination"

urlpatterns = [
    path("initiative/chat/", views.CoordinationHistory.as_view()),
    path("initiative/info-user-role/", views.InfoInitiativeRole.as_view()),
    path("initiative/sent-for-approval/", views.SentForApproval.as_view()),
    path("initiative/add-comment/", views.AddComment.as_view()),
    path("initiative/approval/", views.Approval.as_view()),
    path("initiative/switch/", views.Switch.as_view()),
]
