from django.db import models
from projects.models import Project
from components.models import Initiatives, SettingsStatusInitiative

from django.utils import timezone
from django.contrib.auth import get_user_model
from notifications.models import NotificationsUser

User = get_user_model()

TYPE_SERVICE_MESSAGE = "Служебное сообщение"
TYPE_SEND_APPROVAL = "Отправить на согласование"
TYPE_NEW_COMMENT = "Новый комментарий"
TYPE_INITIATIVE_AGREED = "Инициатива согласована"
TYPE_INITIATIVE_WITHDREW = "Инициатива отозвана"


class CoordinationInitiativeHistory(models.Model):
    initiative = models.ForeignKey(
        Initiatives,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="history_coordination",
    )
    status = models.ForeignKey(
        SettingsStatusInitiative,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )
    coordinator = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )
    date = models.DateTimeField(
        verbose_name="Дата и время сообщения",
        default=timezone.now,
    )
    author_text = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="author_comment",
        blank=True,
        null=True,
    )
    text = models.CharField(max_length=800)

    TYPE_VALUE = [
        (TYPE_SEND_APPROVAL, TYPE_SEND_APPROVAL),
        (TYPE_NEW_COMMENT, TYPE_NEW_COMMENT),
        (TYPE_INITIATIVE_AGREED, TYPE_INITIATIVE_AGREED),
        (TYPE_SERVICE_MESSAGE, TYPE_SERVICE_MESSAGE),
        (TYPE_INITIATIVE_WITHDREW, TYPE_INITIATIVE_WITHDREW),
    ]
    action = models.CharField(
        max_length=30,
        choices=TYPE_VALUE,
    )

    class Meta:
        db_table = "coordination_initiative_history"
        ordering = ["date"]

    @classmethod
    def create(cls, info):
        cls.objects.create(**info)

    @classmethod
    def check_person_add_comment(cls, initiative_id, user):
        initiative: Initiatives = Initiatives.get_by_id(initiative_id)
        if initiative.author == user:
            return True

        return StagesCoordinationInitiative.user_is_coordinator(
            initiative_id, user
        )


class StagesCoordinationInitiative(models.Model):
    initiative = models.ForeignKey(
        Initiatives,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="stages_coordination",
    )
    status = models.ForeignKey(
        SettingsStatusInitiative,
        on_delete=models.CASCADE,
    )
    coordinator_stage = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
    )
    activate = models.BooleanField(default=False)

    @classmethod
    def add_stage(cls, info):
        print("info", info)
        stage = (
            cls.objects.filter(initiative_id=info.get("initiative_id"))
            .filter(coordinator_stage=info.get("coordinator_stage"))
            .filter(status=info.get("status"))
            .first()
        )
        print("stage", stage)
        if not stage:
            return cls.objects.create(**info)
        return stage

    @classmethod
    def check_update_status(cls, initiative):
        status_old = initiative.status
        if all(
            x.activate
            for x in cls.objects.filter(initiative=initiative)
            .filter(status=status_old)
            .all()
        ):
            new_status = (
                SettingsStatusInitiative.get_next_statuses_by_id_initiative(
                    initiative.id
                )
            )
            initiative.status = new_status
            initiative.save()
            return True
        return False

    @classmethod
    def check_coordinator_status(cls, initiative_id, coordinator, status):
        return (
            cls.objects.filter(initiative_id=initiative_id)
            .filter(coordinator_stage=coordinator)
            .filter(status=status)
            .first()
        )

    @classmethod
    def user_is_coordinator(cls, initiative_id, user) -> bool:
        return (
            cls.objects.filter(initiative_id=initiative_id)
            .filter(coordinator_stage_id=user.id)
            .exists()
        )

    @classmethod
    def get_coordinators(cls, initiative):
        items = (
            cls.objects.filter(initiative=initiative)
            .filter(status=initiative.status)
            .all()
        )
        if not items:
            return []
        return [item.coordinator_stage for item in items]

    @classmethod
    def get_coordinators_all_status(cls, initiative_id):
        items = cls.objects.filter(initiative_id=initiative_id).all()
        if not items:
            return []
        return [item.coordinator_stage for item in items]

    @classmethod
    def check_person_approval(cls, initiative_id, user):
        initiative: Initiatives = Initiatives.get_by_id(initiative_id)
        return (
            cls.objects.filter(initiative=initiative)
            .filter(status=initiative.status)
            .filter(coordinator_stage=user)
            .exists()
        )

    @classmethod
    def delete_user_in_project(cls, project, user):
        for init in project.initiatives.all():
            print(init)
            print(cls.user_is_coordinator(init.id, user))
            if cls.user_is_coordinator(init.id, user):
                StagesCoordinationInitiative.delete_now_stage_null_coordinator(
                    init, user
                )

    @classmethod
    def delete_now_stage_null_coordinator(cls, initiative, user):
        coordinmattor_info = (
            cls.objects.filter(initiative=initiative)
            .filter(coordinator_stage=user)
            .filter(activate=False)
            .first()
        )
        if coordinmattor_info:
            CoordinationInitiativeHistory.create(
                {
                    "initiative": initiative,
                    "status": initiative.status,
                    "text": f"Пользователь {user.email} был удален из команды проекта. Согласуйте у другого координатора.",
                    "action": TYPE_SERVICE_MESSAGE,
                }
            )
            NotificationsUser.create(
                user,
                f"В проектке: {initiative.project.name}, был удален куратор {user.email}",
            )
            coordinmattor_info.delete()

    class Meta:
        db_table = "stages_coordination_initiative"
        constraints = [
            models.UniqueConstraint(
                fields=["initiative", "status", "coordinator_stage"],
                name="unique status coordinator_stage",
            )
        ]
