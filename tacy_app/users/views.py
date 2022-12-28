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

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi


class InfoView(views.APIView):
    response_schema_dict = {
        "200": openapi.Response(
            description="Валидный токен + существующий id проекта",
            examples={
                "application/json": {
                    "user": {
                        "id": 1,
                        "email": "z@mail.ru",
                        "first_name": "z",
                        "last_name": "z",
                        "second_name": "z",
                        "phone": "1",
                        "is_superuser": True,
                    },
                    "user_in_project": [
                        {
                            "id": 6,
                            "rights_user": [
                                {
                                    "id": 4,
                                    "name": "Создать инициативу",
                                    "flags": {
                                        "id": 4,
                                        "is_create": True,
                                        "is_coordinate": False,
                                        "is_watch": True,
                                        "project": 2,
                                    },
                                }
                            ],
                            "user": {
                                "id": 1,
                                "first_name": "z",
                                "last_name": "z",
                                "second_name": "z",
                                "email": "z@mail.ru",
                                "phone": "1",
                            },
                            "role_user": {
                                "id": 5,
                                "name": "Наблюдать",
                                "coverage": 0,
                                "project": 2,
                            },
                        }
                    ],
                    "user_flags_in_project": {
                        "is_create": True,
                        "is_coordinate": True,
                        "is_watch": True,
                    },
                }
            },
        ),
        "401": openapi.Response(
            description="Токен идентификации не был передан",
            examples={
                "application/json": {
                    "detail": "Учетные данные не были предоставлены."
                }
            },
        ),
    }

    @swagger_auto_schema(
        operation_description="Информация пользовтеля в проекте",
        responses=response_schema_dict,
        manual_parameters=[
            openapi.Parameter(
                name="id",
                in_=openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                description="ID проекта",
            )
        ],
    )
    def get(self, request, format=None):
        user = request.user
        project = Project.get_project_by_id(request.GET.get("id", -1))
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
    """
    Авторизация пользователя (выдача токена)
    """

    response_schema_dict = {
        "200": openapi.Response(
            description="Валидный запрос, существующая почта + соответсвующий пароль",
            examples={
                "application/json": {
                    "token": "1es31asd...",
                    "user_id": 1,
                    "email": "z@mail.ru",
                }
            },
        ),
        "400 (v1)": openapi.Response(
            description="Без почты нельзя получить токен",
            examples={"application/json": {"email": ["Обязательное поле."]}},
        ),
        "400 (v2)": openapi.Response(
            description="Без пароля нельзя получить токен",
            examples={
                "application/json": {"password": ["Обязательное поле."]}
            },
        ),
        "400 (v3)": openapi.Response(
            description="Были переданы все параметры, но почта не соответвует паролю",
            examples={
                "application/json": {
                    "email or password": [
                        "Неправильный адрес электронной почты или пароль."
                    ]
                }
            },
        ),
        "400 (v4)": openapi.Response(
            description="Формат почты должен быть корректным!",
            examples={
                "application/json": {
                    "email": ["Введите правильный адрес электронной почты."]
                }
            },
        ),
    }

    @swagger_auto_schema(
        request_body=serializers.LoginSerializer,
        operation_description="Авториация пользователя",
        responses=response_schema_dict,
        manual_parameters=[],
    )
    def post(self, request, format=None):
        serializer = serializers.LoginSerializer(
            data=self.request.data, context={"request": self.request}
        )
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            token, created = Token.objects.get_or_create(user=user)
            return Response(
                {"token": token.key, "user_id": user.pk, "email": user.email}
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)
    response_schema_dict = {
        "200": openapi.Response(
            description="Валидный запрос, передан существующий токен",
            examples={
                "application/json": {
                    "message": "Вы успешно вышли из системы.",
                },
            },
        ),
        "401": openapi.Response(
            description="Токен идентификации не был передан",
            examples={
                "application/json": {
                    "detail": "Учетные данные не были предоставлены."
                }
            },
        ),
    }

    @swagger_auto_schema(
        operation_description="Выход из системы",
        responses=response_schema_dict,
        manual_parameters=[],
    )
    def delete(self, request, format=None):
        request.user.auth_token.delete()
        data = {
            "message": "Вы успешно вышли из системы.",
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
            "reset_password_url": f"{settings.SITE_DOMAIN}/reset-password/confirm/?token={reset_password_token.key}",
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
            to=[reset_password_token.user.email],
        )

        msg.attach_alternative(email_html_message, "text/html")
        msg.send()

    @receiver(pre_password_reset)
    def send_sms_update_password(sender, user, *args, **kwargs):
        msg = EmailMultiAlternatives(
            subject=f"Password Reset for {settings.SITE_FULL_NAME}",
            body="Поздравляем с успешным изменением пароля.",
            from_email=settings.EMAIL_HOST_USER,
            to=[user.email],
        )
        msg.send()
