from django.contrib.auth import get_user_model
from rest_framework import serializers

from . import models

User = get_user_model()


class NotificationUserItemSerializer(serializers.ModelSerializer):
    class Meta:
        # depth = 1
        model = models.NotificationsUser
        fields = ["user", "date", "text"]


class NotificationsUserSerializer(serializers.ModelSerializer):
    notifications = NotificationUserItemSerializer(many=True)

    class Meta:
        # depth = 1
        model = User
        fields = ["notifications"]
