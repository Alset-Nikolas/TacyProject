from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.core.mail import EmailMultiAlternatives


class EmailManage:
    @staticmethod
    def send_invitation_new_account(user, context):
        msg = EmailMultiAlternatives(
            subject=f"Вас приглашают присоединиться в приложени {settings.SITE_FULL_NAME}",
            body=f"Перейдите по ссылке {settings.SITE_DOMAIN}/reset-password и смените свой пароль.",
            from_email=settings.EMAIL_HOST_USER,
            to=[user.email],
        )
        msg.send(fail_silently=True)

    @staticmethod
    def send_invitation_new_project(user, context):
        msg = EmailMultiAlternatives(
            subject=f"Вас пригласили учавствовать в новом проекте приложения {settings.SITE_FULL_NAME}",
            body=f"Перейдите по ссылке {settings.SITE_DOMAIN}.",
            from_email=settings.EMAIL_HOST_USER,
            to=[user.email],
        )
        print("user.email", user.email)
        msg.send(fail_silently=True)

    @staticmethod
    def send_removed_in_project(user, context):
        project = context.get("project")
        msg = EmailMultiAlternatives(
            subject=f"Вас убрали с проекта {project.name} '{settings.SITE_FULL_NAME}'",
            body=f"Спасибо, что участвовали в проекте",
            from_email=settings.EMAIL_HOST_USER,
            to=[user.email],
        )
        msg.send(fail_silently=True)

    @staticmethod
    def send_msg_many_users(users, title, text):
        for user in users:
            msg = EmailMultiAlternatives(
                subject=title,
                body=text,
                from_email=settings.EMAIL_HOST_USER,
                to=[user.email],
            )
            msg.send(fail_silently=True)
