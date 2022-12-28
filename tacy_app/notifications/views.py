from rest_framework import views
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework import viewsets
from .serializers import (
    NotificationUserItemSerializer,
)
from rest_framework.pagination import PageNumberPagination

from .models import NotificationsUser


class UserNotificationsView(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationUserItemSerializer
    pagination_class = PageNumberPagination

    def get_queryset(self):
        user = self.request.user
        if user.is_anonymous:
            return []
        return NotificationsUser.objects.filter(user=user).all()
