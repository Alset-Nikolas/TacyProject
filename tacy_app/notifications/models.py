# Create your models here.
from django.conf import settings
from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model

User = get_user_model()


class NotificationsUser(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    date = models.DateTimeField(
        help_text="Введите дати время новости",
        verbose_name="Дата и время новости",
        default=timezone.now,
    )
    text = models.CharField(
        max_length=800,
    )

    class Meta:
        ordering = ["-date"]

    @classmethod
    def create(cls, user, text):
        cls.objects.create(user=user, text=text)

    @classmethod
    def create_new_init(cls, project, info):
        author_id = info.get("author_id")
        author = User.get_user_by_id(author_id)
        for user in project.get_community():
            cls.objects.create(
                user=user,
                text=f"В проекте '{project.name}' новая инициатива {info.get('name')}, автор {author.email}",
            )

    @classmethod
    def add_comment(cls, initiative, users):
        for user in users:
            cls.objects.create(
                user=user,
                text=f"Новое сообщение в чате инициативы {initiative.name} в проекте {initiative.project.name}",
            )

    @classmethod
    def change_stage(cls, initiative, state_name):
        cls.objects.create(
            user=initiative.author,
            text=f"Инициатива {initiative.name} в проекте {initiative.project.name} одобрена на очередном этапе, статус инициативы стал {state_name}.",
        )

    @classmethod
    def init_approval(cls, initiative):
        cls.objects.create(
            user=initiative.author,
            text=f"Инициатива {initiative.name} согласована в проекте: {initiative.project.name}",
        )

    @classmethod
    def sent_approval(cls, initiative, info):
        initiative_id = info.get("initiative_id")
        coordinator_obj = info.get("coordinator")
        author_obj = info.get("author_text")
        status_obj = info.get("status")
        cls.objects.create(
            user=author_obj,
            text=f"Вы отправили инициативу {initiative.name} на согласование {coordinator_obj.email} в проекте {initiative.project.name}. Статус инициативы сейчас {status_obj.name}",
        )
        cls.objects.create(
            user=coordinator_obj,
            text=f"Вам отправили инициативу {initiative.name} на согласование {author_obj.email} в проекте {initiative.project.name}. Статус инициативы сейчас {status_obj.name}",
        )
