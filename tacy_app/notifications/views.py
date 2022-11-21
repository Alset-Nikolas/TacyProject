from rest_framework import views
from rest_framework.response import Response

from .serializers import NotificationsUserSerializer, NotificationUserItemSerializer


class UserNotificationsView(views.APIView):
    def get(self, request, form=None):
        user = request.user
        serializer = NotificationsUserSerializer(user)
        return Response(serializer.data, 200)

    def post(self, request, format=None):
        data = request.data
        data["user"] = request.user.pk
        serializer = NotificationUserItemSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"status": 200}, 200)
