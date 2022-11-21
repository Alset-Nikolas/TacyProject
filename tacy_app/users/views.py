from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.dispatch import receiver
from django.template.loader import render_to_string
from django_rest_passwordreset.signals import (
    pre_password_reset,
    reset_password_token_created,
)
from rest_framework import permissions, status, views
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.response import Response
from projects.models import Project

from . import serializers


class InfoView(views.APIView):
    def get(self, request, format=None):
        user = request.user
        project = Project.get_project_by_id(request.GET.get("id", None))
        user_serializer = serializers.UserSerializer(instance=user)
        if project:
            community_info = project.community_info.filter(user_id=user).all()
            community_project = serializers.СommunityProjectSerializer(
                instance=community_info, many=True
            )

            return Response(
                {
                    "user": user_serializer.data,
                    "user_in_project": community_project.data,
                    "user_flags_in_project": project.get_user_rights_flag_in_project(
                        user, project
                    ),
                },
                status=status.HTTP_200_OK,
            )
        return Response(
            {
                "user": user_serializer.data,
                "user_in_project": [],
            },
            status=status.HTTP_200_OK,
        )


class LoginView(ObtainAuthToken):
    def post(self, request, format=None):
        serializer = serializers.LoginSerializer(
            data=self.request.data, context={"request": self.request}
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        token, created = Token.objects.get_or_create(user=user)
        return Response(
            {"token": token.key, "user_id": user.pk, "email": user.email}
        )


class LogoutView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def delete(self, request, format=None):
        request.user.auth_token.delete()
        data = {
            "message": "You have successfully logged out.",
        }
        return Response(data, status=status.HTTP_200_OK)


class CustomPasswordResetView:
    @receiver(reset_password_token_created)
    def password_reset_token_created(
        sender, reset_password_token, *args, **kwargs
    ):
        """
        Handles password reset tokens
        When a token is created, an e-mail needs to be sent to the user
        """

        context = {
            "current_user": reset_password_token.user,
            "email": reset_password_token.user.email,
            "reset_password_url": f"{settings.SITE_DOMAIN}:3000/reset-password/confirm/?token={reset_password_token.key}",
        }

        email_html_message = render_to_string(
            "email/user_reset_password.html", context
        )
        email_plaintext_message = render_to_string(
            "email/user_reset_password.txt", context
        )

        msg = EmailMultiAlternatives(
            subject="Password Reset for {}".format(settings.SITE_FULL_NAME),
            body=email_plaintext_message,
            from_email=settings.EMAIL_HOST_USER,
            to=["Alset.Nikolas@yandex.ru"],
            # to=[reset_password_token.user.email],
        )

        msg.attach_alternative(email_html_message, "text/html")
        msg.send()

    @receiver(pre_password_reset)
    def send_sms_update_password(sender, user, *args, **kwargs):
        msg = EmailMultiAlternatives(
            subject=f"Password Reset for {settings.SITE_FULL_NAME}",
            body="Поздравляем с успешным изменением пароля.",
            from_email=settings.EMAIL_HOST_USER,
            to=["Alset.Nikolas@yandex.ru"],
            # to=[reset_password_token.user.email],
        )
        msg.send()
