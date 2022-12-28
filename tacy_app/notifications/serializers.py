from django.contrib.auth import get_user_model
from rest_framework import serializers

from . import models

User = get_user_model()


class NotificationUserItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.NotificationsUser
        fields = [
            "user",
            "date",
            "text",
        ]
