from django.db import models
from projects.models import (
    Project,
    PropertiesProject,
    PropertiesItemsProject,
    MetricsProject,
    RolesProject,
    СommunityProject,
)
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()
from notifications.email import EmailManage
from notifications.models import NotificationsUser

from django.db.models import Q
from functools import reduce
import operator


class SettingsComponents(models.Model):
    """
    Настройки компонентов проекта
    """

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="settings_initiatives",
    )

    @classmethod
    def get_settings_by_proejct(cls, project):
        return cls.objects.filter(project=project).first()

    @classmethod
    def create(cls, project_id):
        old = cls.objects.filter(project_id=project_id).first()
        if not old:
            return cls.objects.create(project_id=project_id)
        return old


# +++++++++++++++++++++++++++Initiatives+++++++++++++++++++++++++++
class Initiatives(models.Model):
    """
    Инициативы проекта
    """

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="initiatives",
        help_text="Проект к которому относятся инициативы",
        verbose_name="Проект",
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="creator_initiatives",
    )
    status = models.ForeignKey(
        "SettingsStatusInitiative",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="initiatives",
    )
    name = models.CharField(
        max_length=500,
        verbose_name="Название инициативы",
        help_text="Введите название инициативы",
    )
    current_state = models.CharField(
        max_length=500,
        verbose_name="Текущее состояние инициативы",
        help_text="Введите текущее состояние инициативы",
        blank=True,
        null=True,
    )
    reasons = models.CharField(
        max_length=500,
        verbose_name="Предпосылки инициативы",
        help_text="Введите предпосылкт инициативы",
        blank=True,
        null=True,
    )
    description = models.CharField(
        max_length=500,
        verbose_name="Описание инициативы",
        help_text="Введите описание инициативы",
        blank=True,
        null=True,
    )
    date_registration = models.DateField(
        verbose_name="Дата регистраци инициативы",
        help_text="Введите дату регистрации инициативы",
        default=timezone.now,
    )
    date_start = models.DateField(
        verbose_name="min(date start events)",
        help_text="Введите дату начала инициативы",
        default=timezone.now,
    )
    date_end = models.DateField(
        verbose_name="max(date end events)",
        help_text="Введите дату окончания инициативы",
        default=timezone.now,
    )
    activate = models.BooleanField(
        default=False,
        verbose_name="Флаг Инициатва прошла согласование",
    )
    failure = models.BooleanField(
        default=False,
        verbose_name="Флаг Инициативу отозвали",
    )

    class Meta:
        db_table = "initiatives"
        # constraints = [
        #     models.UniqueConstraint(
        #         fields=["project", "name"], name="unique name initiatives"
        #     )
        # ]

    # @classmethod
    # def get_by_name(cls, project, name):
    #     return cls.objects.filter(project=project).filter(name=name).first()

    @classmethod
    def get_by_id(cls, id):
        return cls.objects.filter(id=id).first()

    def get_community_roles(self):
        community_in_init: list[RolesUserInInitiative] = self.user_roles.all()
        roles_in_project: list[
            RolesProject
        ] = RolesProject.get_roles_by_project(self.project)
        ans = [{"role": x, "community": []} for x in roles_in_project]
        for user_in_init in community_in_init:
            for item in ans:
                if item.get("role") == user_in_init.role:
                    elemant = dict()
                    elemant["user_info"] = (
                        СommunityProject.objects.filter(project=self.project)
                        .filter(user=user_in_init.user)
                        .first()
                    )
                    coordination_init = (
                        self.stages_coordination.filter(
                            coordinator_stage__user=user_in_init.user
                        )
                        .filter(status=self.status)
                        .first()
                    )

                    if not coordination_init:
                        status = None
                    else:
                        status = coordination_init.activate
                    elemant["status"] = status
                    item["community"].append(elemant)
                    break
        return ans

    @classmethod
    def create_or_update(cls, info) -> int:
        if "project" in info:
            info["project_id"] = info.pop("project")
        if "author" in info:
            info["author_id"] = info.pop("author")
        if info["id"] < 0:
            info.pop("id")
            initiative = cls.objects.create(**info)
            status = (
                SettingsStatusInitiative.get_start_statuses_by_id_initiative(
                    initiative.id
                )
            )

            initiative.status = status
            project = Project.get_project_by_id(info["project_id"])
            NotificationsUser.create_new_init(project, info)

        else:
            initiative = cls.objects.filter(id=info["id"]).first()
            initiative.name = info.get("name")
            initiative.current_state = info.get("current_state")
            initiative.reasons = info.get("reasons")
            initiative.description = info.get("description")
            initiative.date_start = info.get("date_start")
            initiative.date_end = info.get("date_end")
        initiative.save()
        return initiative.id

    def update_date(self):
        events = self.events.all()
        if len(events) > 0:
            self.date_start = min(x.date_start for x in events)
            self.date_end = max(x.date_end for x in events)
            self.save()

    def update_metrics(self):
        for m in self.project.metrics.all():
            if (
                not InitiativesMetricsFields.objects.filter(initiative=self)
                .filter(metric=m)
                .first()
            ):
                InitiativesMetricsFields.objects.create(
                    initiative=self, metric=m, value=0
                )

    def update_properties(self):
        for p in self.project.properties.all():
            if (
                not InitiativesPropertiesFields.objects.filter(initiative=self)
                .filter(title=p)
                .first()
            ):
                InitiativesPropertiesFields.objects.create(
                    initiative=self, title=p
                )

    def update_addfields(self):
        settings_initiatives = self.project.settings_initiatives.first()
        for new_field in SettingsAddFeldsInitiative.objects.filter(
            settings_project=settings_initiatives
        ).all():
            if (
                not InitiativesAddFields.objects.filter(initiative=self)
                .filter(title=new_field)
                .exists()
            ):
                InitiativesAddFields.objects.create(
                    initiative=self, title=new_field, value=""
                )

    def update_files(self):
        settings_initiatives = self.project.settings_initiatives.first()

        for new_file in SettingsFilesInitiative.objects.filter(
            settings_project=settings_initiatives
        ).all():

            if (
                not InitiativesFiles.objects.filter(initiative=self)
                .filter(title=new_file)
                .exists()
            ):
                InitiativesFiles.objects.create(
                    initiative=self,
                    title=new_file,
                    file=None,
                    file_name="",
                )

    def check_updates(self):
        self.update_date()
        self.update_metrics()
        self.update_properties()
        self.update_addfields()
        self.update_files()

    @classmethod
    def get_user_initiatievs(cls, user, project):
        list_inits = []
        query_role = reduce(
            operator.or_,
            (
                Q(author=user),
                operator.and_(
                    Q(stages_coordination__coordinator_stage__user=user),
                    Q(stages_coordination__activate=True),
                ),
            ),
        )
        list_inits = (
            cls.objects.filter(project=project)
            .filter(failure=False)
            .filter(query_role)
        )
        return list_inits

    def delete_node(self):
        for item in InitiativesMetricsFields.objects.filter(
            initiative=self
        ).all():
            InitiativesMetricsFields.add_delta_value(
                self, metric_id=item.metric.id, delta=-item.value
            )
        return self.delete()

    @classmethod
    def get_status_failure(cls, init):
        init.status = (
            SettingsStatusInitiative.get_status_failure_by_id_initiative(
                init.id
            )
        )
        init.save()

    @classmethod
    def get_status_start(cls, init):
        status = SettingsStatusInitiative.get_start_statuses_by_id_initiative(
            init.id
        )
        if not status:
            status = (
                SettingsStatusInitiative.get_status_agreed_by_id_initiative(
                    init.id
                )
            )
        init.status = status
        init.save()

    @classmethod
    def get_user_rigts(cls, user, initiative):
        flags = Project.get_user_rights_flag_in_project(
            user, initiative.project
        )

        role: RolesProject = RolesUserInInitiative.get_user_role(
            user, initiative
        )
        is_approve = None
        is_update = None
        if user.is_superuser:
            is_approve = True
            is_update = True
        elif role is None:
            is_approve = False
            is_update = False
        else:
            is_approve = role.is_approve
            is_update = role.is_update

        flags["is_approve"] = is_approve
        flags["is_update"] = is_update
        return flags

    def get_settings_init_files(self):
        init_status = self.status
        project = self.project
        settings = project.settings_initiatives.first()
        files = (
            SettingsFilesInitiative.objects.filter(settings_project=settings)
            .order_by("status__value")
            .all()
        )
        if init_status.value < 0:
            return files
        res = []
        for file in files:
            if 0 <= file.status.value <= init_status.value:
                res.append(file)
        return res

    def get_files(self):
        res = []
        for title_setting in self.get_settings_init_files():
            file = (
                InitiativesFiles.objects.filter(title=title_setting)
                .filter(initiative=self)
                .first()
            )
            if not file:
                file = InitiativesFiles.objects.create(
                    title=title_setting,
                    initiative=self,
                    file=None,
                    file_name="",
                )
            res.append({"title": title_setting, "file": file})
        return res

    def get_file_status(self):
        return all(bool(x.get("file").file) for x in self.get_files())


class InitiativesAddFields(models.Model):
    """
    Дополнительные поля инициативы
    """

    initiative = models.ForeignKey(
        Initiatives,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="addfields",
    )
    title = models.ForeignKey(
        "SettingsAddFeldsInitiative",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )
    value = models.CharField(
        max_length=500,
        blank=True,
        null=True,
    )

    class Meta:
        db_table = "initiatives_add_fields"
        constraints = [
            models.UniqueConstraint(
                fields=["initiative", "title"],
                name="unique field initiatives title",
            )
        ]

    @classmethod
    def get_by_id(cls, id):
        return cls.objects.filter(id=id).first()

    @classmethod
    def create(cls, initiative_id, addfields):
        cls.objects.filter(initiative_id=initiative_id).delete()
        for addfield in addfields:
            cls.objects.create(
                initiative_id=initiative_id,
                title_id=addfield.get("title")["id"],
                value=addfield.get("value"),
            )


class InitiativesPropertiesFields(models.Model):
    initiative = models.ForeignKey(
        Initiatives,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="properties_fields",
    )
    title = models.ForeignKey(
        PropertiesProject,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )
    values = models.ManyToManyField(PropertiesItemsProject)

    class Meta:
        db_table = "initiatives_properties_fields"
        # constraints = [
        #     models.UniqueConstraint(
        #         fields=["initiative", "title"],
        #         name="unique field properties title",
        #     )
        # ]

    @classmethod
    def create_or_update(cls, initiative_id, info):
        ids_not_del = []
        for prop_info in info:
            title_id = prop_info["title"]["id"]
            prop = (
                cls.objects.filter(initiative_id=initiative_id)
                .filter(title_id=title_id)
                .first()
            )
            if not prop:
                prop = cls.objects.create(
                    initiative_id=initiative_id,
                    title_id=title_id,
                )
            prop.values.clear()
            for value in prop_info["values"]:
                value = PropertiesItemsProject.get_property_item_by_id(
                    value.get("id")
                )
                prop.values.add(value)
            ids_not_del.append(prop.id)
        cls.objects.filter(initiative_id=initiative_id).exclude(
            id__in=ids_not_del
        ).delete()


class InitiativesMetricsFields(models.Model):
    initiative = models.ForeignKey(
        Initiatives,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="metric_fields",
    )
    metric = models.ForeignKey(
        MetricsProject,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )
    value = models.FloatField(max_length=200)
    # TODO is_agregate = False

    class Meta:
        db_table = "initiatives_metric_fields"
        constraints = [
            models.UniqueConstraint(
                fields=["initiative", "metric"],
                name="unique field metric title",
            )
        ]

    @classmethod
    def create(cls, initiative_id, info):
        for m_info in info:
            metric_id = m_info["metric"]["id"]
            value = m_info.get("value")
            m = (
                cls.objects.filter(initiative_id=initiative_id)
                .filter(metric_id=metric_id)
                .first()
            )
            if not m:
                m = cls.objects.create(
                    initiative_id=initiative_id,
                    metric_id=metric_id,
                    value=value,
                )
                m.value = 0
            m.save()

    @classmethod
    def add_delta_value(
        cls, initiative: Initiatives, metric_id: int, delta: int
    ):
        el = (
            cls.objects.filter(initiative=initiative)
            .filter(metric_id=metric_id)
            .first()
        )
        el.value += float(delta)
        el.value = round(el.value, 4)
        el.save()
        MetricsProject.add_delta_value(metric_id, delta)


def directory_path(instance, filename):
    return f"files/initiative/{instance.id}/{instance.title.id}/{filename}"


class InitiativesFiles(models.Model):
    id = models.AutoField(primary_key=True)
    initiative = models.ForeignKey(
        Initiatives,
        on_delete=models.CASCADE,
        related_name="files",
    )
    title = models.ForeignKey(
        "SettingsFilesInitiative",
        on_delete=models.CASCADE,
    )
    file = models.FileField(upload_to=directory_path, null=True)
    file_name = models.CharField(max_length=300)

    class Meta:
        db_table = "initiatives_files"
        constraints = [
            models.UniqueConstraint(
                fields=["initiative", "title"],
                name="unique field initiative title",
            )
        ]


# +++++++++++++++++++++++++++Events+++++++++++++++++++++++++++
class Events(models.Model):
    """
    Мероприятия инициативы
    """

    initiative = models.ForeignKey(
        Initiatives,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="events",
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="creator_events",
    )
    name = models.CharField(
        max_length=500,
        verbose_name="Название мероприятия",
        help_text="Введите название мероприятия",
    )
    date_start = models.DateField(
        verbose_name="Дата начала мероприятия",
        help_text="Введите дату начала мероприятия",
    )
    date_end = models.DateField(
        verbose_name="Дата окончания мероприятия",
        help_text="Введите дату окончания мероприятия",
    )
    ready = models.BooleanField(
        default=False,
        verbose_name="Отметка об выполнении",
    )

    class Meta:
        db_table = "events"
        # constraints = [
        #     models.UniqueConstraint(
        #         fields=["initiative", "name"],
        #         name="unique event initiative name",
        #     )
        # ]

    @classmethod
    def get_by_id(cls, id):
        return cls.objects.filter(id=id).first()

    @classmethod
    def get_by_name(cls, initiative_id, name):
        return (
            cls.objects.filter(initiative_id=initiative_id)
            .filter(name=name)
            .first()
        )

    @classmethod
    def get_status(cls, event):
        if event.ready:
            return "Выполнено"
        t = timezone.now().date()
        if t < event.date_start:
            return "Запланировано"
        if event.date_start <= t <= event.date_end:
            return "В работе"
        return "Просрочено"

    @classmethod
    def create_or_update(cls, info):
        id_event = info.pop("id")
        if "initiative" in info:
            info["initiative_id"] = info.pop("initiative").id
        if id_event < 0:
            return cls.objects.create(**info).id
        event = cls.objects.filter(id=id_event).first()
        event.name = info.get("name", None)
        event.date_start = info.get("date_start", None)
        event.date_end = info.get("date_end", None)
        event.ready = info.get("ready", False)
        event.save()
        return event.id

    def update_addfields(self):
        settings_initiatives = (
            self.initiative.project.settings_initiatives.first()
        )
        for new_field in SettingsAddFeldsEvent.objects.filter(
            settings_project=settings_initiatives
        ).all():
            if (
                not EventsAddFields.objects.filter(event=self)
                .filter(title=new_field)
                .exists()
            ):
                EventsAddFields.objects.create(
                    event=self, title=new_field, value=""
                )

    def update_metrics(self):
        for m in self.initiative.project.metrics.all():
            if (
                not EventMetricsFields.objects.filter(event=self)
                .filter(metric=m)
                .first()
            ):
                EventMetricsFields.objects.create(
                    event=self, metric=m, value=0
                )

    def check_updates(self):
        self.update_metrics()
        self.update_addfields()

    @classmethod
    def delete_node(cls, event_id):
        event = Events.get_by_id(event_id)
        initiative: Initiatives = event.initiative
        for ev in event.metric_fields.all():
            metric_id = ev.metric.id
            InitiativesMetricsFields.add_delta_value(
                initiative, metric_id, -ev.value
            )
        event.delete()


class EventsAddFields(models.Model):
    """
    Дополнительные поля мероприятия
    """

    event = models.ForeignKey(
        Events,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="addfields",
    )
    title = models.ForeignKey(
        "SettingsAddFeldsEvent",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )
    value = models.CharField(max_length=500, blank=True)

    class Meta:
        db_table = "event_add_fields"
        constraints = [
            models.UniqueConstraint(
                fields=["event", "title"],
                name="unique field event title",
            )
        ]

    @classmethod
    def get_by_id(cls, id):
        return cls.objects.filter(id=id).first()

    @classmethod
    def create(cls, event_id, addfields):
        cls.objects.filter(event_id=event_id).delete()
        for addfield in addfields:
            cls.objects.create(
                event_id=event_id,
                title_id=addfield.get("id"),
                value=addfield.get("value"),
            )


class EventMetricsFields(models.Model):
    event = models.ForeignKey(
        Events,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="metric_fields",
    )
    metric = models.ForeignKey(
        MetricsProject,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )
    value = models.FloatField(max_length=500)

    class Meta:
        db_table = "event_metrics_fields"
        constraints = [
            models.UniqueConstraint(
                fields=["event", "metric"],
                name="unique event field metric title",
            )
        ]

    @classmethod
    def create_or_update(cls, event_id, info):
        ids_not_delete = []
        metrics_delta = dict()
        for el in info:
            metric_id = el["metric"]["id"]
            m = (
                cls.objects.filter(event_id=event_id)
                .filter(metric_id=metric_id)
                .first()
            )
            value = el.get("value")
            if not m:
                m = cls.objects.create(
                    event_id=event_id,
                    metric_id=metric_id,
                    value=value,
                )
                delta = value
            else:
                delta = value - m.value
            m.value = round(value, 5)
            m.save()
            metrics_delta[metric_id] = round(delta, 5)
            ids_not_delete.append(m.id)

        cls.objects.filter(event_id=event_id).exclude(
            id__in=ids_not_delete
        ).delete()

        return metrics_delta


# +++++++++++++++++++++++++++Risks+++++++++++++++++++++++++++
class Risks(models.Model):
    """
    Риски инициативы
    """

    initiative = models.ForeignKey(
        Initiatives,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="risks",
    )

    name = models.CharField(
        max_length=200,
        verbose_name="Название риска",
        help_text="Введите название риска",
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="author_risks",
    )

    class Meta:
        # constraints = [
        #     models.UniqueConstraint(
        #         fields=["initiative", "name"],
        #         name="unique field risk name",
        #     )
        # ]
        db_table = "risks"

    @classmethod
    def get_by_id(cls, id):
        return cls.objects.filter(id=id).first()

    @classmethod
    def cheack_name(cls, initiative, name):
        return (
            cls.objects.filter(initiative=initiative)
            .filter(name=name)
            .exists()
        )

    @classmethod
    def create_or_update(cls, info):
        id = info.pop("id")
        if "initiative" in info:
            info["initiative_id"] = info.pop("initiative")
        if "author" in info:
            info["author_id"] = info.pop("author")

        if id < 0:
            return Risks.objects.create(**info).id
        risk_obj = Risks.get_by_id(id)
        risk_obj.name = info.get("name")
        risk_obj.save()
        return risk_obj.id

    def update_addfields(self):
        settings_initiatives = (
            self.initiative.project.settings_initiatives.first()
        )

        for new_field in SettingsAddFeldsRisks.objects.filter(
            settings_project=settings_initiatives
        ).all():

            if (
                not RisksAddFields.objects.filter(risk=self)
                .filter(title=new_field)
                .exists()
            ):
                RisksAddFields.objects.create(
                    risk=self, title=new_field, value=""
                )

    def check_updates(self):
        self.update_addfields()


class RisksAddFields(models.Model):
    """
    Дополнительные поля рисков
    """

    risk = models.ForeignKey(
        Risks,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="addfields",
    )
    title = models.ForeignKey(
        "SettingsAddFeldsRisks",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )
    value = models.CharField(
        max_length=500,
        blank=True,
    )

    class Meta:
        db_table = "risk_add_fields"
        constraints = [
            models.UniqueConstraint(
                fields=["risk", "title"],
                name="unique field risk title",
            )
        ]

    @classmethod
    def create(cls, risk_id, addfields):
        cls.objects.filter(risk_id=risk_id).delete()
        for addfield in addfields:
            cls.objects.create(
                risk_id=risk_id,
                title_id=addfield.get("id"),
                value=addfield.get("value"),
            )


# +++++++++++++++++++++++++++SETTINGS+++++++++++++++++++++++++++
class SettingsStatusInitiative(models.Model):
    """
    Настройки:
        Набор статусов инициатив
    """

    settings_project = models.ForeignKey(
        SettingsComponents,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="initiative_status",
        help_text="Проект к которому относятся статусы инициативы",
        verbose_name="Проект",
    )
    value = models.IntegerField(
        verbose_name="Вес статуса",
    )

    name = models.CharField(
        max_length=200,
        verbose_name="Название статуса",
        help_text="Введите название статуса",
    )

    def __str__(self):
        return f'<SettingsStatusInitiative: name="{self.name}"; id={self.id}>'

    class Meta:
        db_table = "settings_status_initiative"
        constraints = [
            models.UniqueConstraint(
                fields=["settings_project", "name"],
                name="unique status name initiatives",
            )
        ]

    @classmethod
    def get_statuses_by_id_initiative(cls, init_id: int):
        init = Initiatives.get_by_id(init_id)
        project = init.project
        settings_initiatives: SettingsComponents = (
            project.settings_initiatives.first()
        )
        return cls.objects.filter(settings_project=settings_initiatives).all()

    @classmethod
    def get_start_statuses_by_id_initiative(cls, init_id: int):
        init = Initiatives.get_by_id(init_id)
        project = init.project
        settings_initiatives: SettingsComponents = (
            project.settings_initiatives.first()
        )
        start_status = (
            cls.objects.filter(settings_project=settings_initiatives)
            .filter(value=0)
            .first()
        )
        if not start_status:
            start_status = (
                cls.objects.filter(settings_project=settings_initiatives)
                .filter(value=-1)
                .first()
            )
        return start_status

    @classmethod
    def get_status_agreed_by_id_initiative(cls, init_id: int):
        init = Initiatives.get_by_id(init_id)
        project = init.project
        settings_initiatives: SettingsComponents = (
            project.settings_initiatives.first()
        )
        return (
            cls.objects.filter(settings_project=settings_initiatives)
            .filter(value=-1)
            .first()
        )

    @classmethod
    def get_status_failure_by_id_initiative(cls, init_id: int):
        init = Initiatives.get_by_id(init_id)
        project = init.project
        settings_initiatives: SettingsComponents = (
            project.settings_initiatives.first()
        )
        return (
            cls.objects.filter(settings_project=settings_initiatives)
            .filter(value=-2)
            .first()
        )

    @classmethod
    def get_next_statuses_by_id_initiative(cls, init_id: int):
        init = Initiatives.get_by_id(init_id)
        project = init.project
        settings_initiatives: SettingsComponents = (
            project.settings_initiatives.first()
        )
        next_state = (
            cls.objects.filter(settings_project=settings_initiatives)
            .filter(value=init.status.value + 1)
            .first()
        )
        if not next_state:
            return cls.get_status_agreed_by_id_initiative(init_id)
        return next_state

    @classmethod
    def generate_defauld_status(cls, settings_project):
        if (
            not cls.objects.filter(settings_project=settings_project)
            .filter(value=-1)
            .first()
        ):
            cls.objects.create(
                settings_project=settings_project,
                value=-1,
                name="Завершено",
            )
        if (
            not cls.objects.filter(settings_project=settings_project)
            .filter(value=-2)
            .first()
        ):
            cls.objects.create(
                settings_project=settings_project,
                value=-2,
                name="Отозвано",
            )

    @classmethod
    def create_or_update(cls, settings_components, info):
        ids_not_delete = []
        for value, el_info in enumerate(info):
            name_field = el_info.get("name")
            old_el = (
                cls.objects.filter(settings_project_id=settings_components)
                .filter(name=name_field)
                .first()
            )
            if not old_el:
                el_info["settings_project_id"] = settings_components
                el_info["value"] = value
                old_el = cls.objects.create(**el_info)
            else:
                old_el.value = value
                old_el.save()
            ids_not_delete.append(old_el.id)
        for item in (
            cls.objects.filter(settings_project_id=settings_components)
            .exclude(id__in=ids_not_delete)
            .all()
        ):
            if item.value >= 0:
                inits = [
                    x for x in Initiatives.objects.filter(status=item).all()
                ]
                item.delete()
                for init in inits:
                    start_status = SettingsStatusInitiative.get_start_statuses_by_id_initiative(
                        init.id
                    )
                    init.status = start_status
                    init.save()


def add_field_create_or_update_base(cls, settings_components, info):
    ids_not_delete = []
    for el_info in info:
        title_field = el_info.get("title")
        old_el = (
            cls.objects.filter(settings_project_id=settings_components)
            .filter(title=title_field)
            .first()
        )
        if not old_el:
            el_info["settings_project_id"] = settings_components
            old_el = cls.objects.create(**el_info)
        else:
            old_el.type = el_info.get("type")
            old_el.save()
        ids_not_delete.append(old_el.id)

    cls.objects.filter(settings_project_id=settings_components).exclude(
        id__in=ids_not_delete
    ).delete()


class SettingsAddFeldsInitiative(models.Model):
    """
    Настройки:
        Набор доп. полей инициатив
    """

    STRING = "str"
    INTEGER = "int"
    FLOAT = "float"
    DATE = "date"
    TYPE_VALUE = [
        (STRING, "string"),
        (INTEGER, "integer"),
        (FLOAT, "float"),
        (DATE, "date"),
    ]

    settings_project = models.ForeignKey(
        SettingsComponents,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="initiative_addfields",
    )

    title = models.CharField(
        max_length=200,
        verbose_name="Название дополнительного поля",
        help_text="Введите название инициативы",
    )

    type = models.CharField(
        max_length=30,
        choices=TYPE_VALUE,
        default=STRING,
    )

    class Meta:
        db_table = "project_settings_initiative_add_fields"

    @classmethod
    def create_or_update(cls, settings_components, info):
        add_field_create_or_update_base(cls, settings_components, info)

    @classmethod
    def get_by_settings_project(cls, settings_project_id):
        return cls.objects.filter(
            settings_project_id=settings_project_id
        ).all()


class SettingsAddFeldsEvent(models.Model):
    """
    Настройки:
        набор доп. полей мероприятий
    """

    STRING = "str"
    INTEGER = "int"
    FLOAT = "float"
    DATE = "date"
    TYPE_VALUE = [
        (STRING, "string"),
        (INTEGER, "integer"),
        (FLOAT, "float"),
        (DATE, "date"),
    ]

    settings_project = models.ForeignKey(
        SettingsComponents,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="event_addfields",
    )

    title = models.CharField(
        max_length=200,
        verbose_name="Название дополнительного поля",
        help_text="Введите название инициативы",
    )

    type = models.CharField(
        max_length=200,
        choices=TYPE_VALUE,
        default=STRING,
    )

    class Meta:
        db_table = "project_settings_event_add_fields"

    @classmethod
    def create_or_update(cls, project, info):
        add_field_create_or_update_base(cls, project, info)

    @classmethod
    def get_by_id(cls, id):
        return cls.objects.filter(id=id)

    @classmethod
    def get_by_settings_project(cls, settings_project_id):
        return cls.objects.filter(
            settings_project_id=settings_project_id
        ).all()


class SettingsAddFeldsRisks(models.Model):
    """
    Настройки:
        Набор доп полей рисков
    """

    STRING = "str"
    INTEGER = "int"
    FLOAT = "float"
    DATE = "date"
    TYPE_VALUE = [
        (STRING, "string"),
        (INTEGER, "integer"),
        (FLOAT, "float"),
        (DATE, "date"),
    ]

    settings_project = models.ForeignKey(
        SettingsComponents,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="risks_addfields",
    )

    title = models.CharField(
        max_length=200,
        verbose_name="Название дополнительного поля",
        help_text="Введите название инициативы",
    )

    type = models.CharField(
        max_length=200,
        choices=TYPE_VALUE,
        default=STRING,
    )

    class Meta:
        db_table = "project_settings_risk_add_fields"

    @classmethod
    def create_or_update(cls, project, info):
        add_field_create_or_update_base(cls, project, info)

    @classmethod
    def get_by_settings_project(cls, settings_project_id):
        return cls.objects.filter(
            settings_project_id=settings_project_id
        ).all()


class SettingsFilesInitiative(models.Model):
    """
    Настройки:
        Файлов в инициативу
    """

    id = models.AutoField(primary_key=True)
    settings_project = models.ForeignKey(
        SettingsComponents,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="settings_files",
    )

    title = models.CharField(
        max_length=200,
        verbose_name="Название файла",
        help_text="Введите название файла",
    )

    status = models.ForeignKey(
        SettingsStatusInitiative,
        related_name="settings_files",
        on_delete=models.CASCADE,
    )

    class Meta:
        db_table = "project_settings_files"


# -------------------------------------------------------------------


class RolesUserInInitiative(models.Model):
    initiative = models.ForeignKey(
        Initiatives,
        on_delete=models.CASCADE,
        related_name="user_roles",
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
    )
    role = models.ForeignKey(
        RolesProject,
        on_delete=models.CASCADE,
    )

    @classmethod
    def delete_user_in_project(cls, user, project):
        cls.objects.filter(user=user).filter(
            initiative__project=project
        ).delete()

    @classmethod
    def get_user_role(cls, user, initiative):
        role_user_fact = (
            cls.objects.filter(user=user).filter(initiative=initiative).first()
        )
        if role_user_fact:
            return role_user_fact.role

    @classmethod
    def get_users_can_approved(cls, initiative):
        community_init: list = (
            cls.objects.filter(initiative=initiative)
            .filter(role__is_approve=True)
            .all()
        )
        return [c.user for c in community_init]
