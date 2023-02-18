import typing

from django.contrib.auth import get_user_model
from django.db import models
from django.utils import timezone
from django.db.models import Q
from functools import reduce
import operator
from django.db.models import Count
from django.core.exceptions import ValidationError
from django.conf import settings
from django.db.utils import NotSupportedError

User = get_user_model()


def directory_path(instance, filename):
    return f"files/project/{instance.project.name}/{filename}"


class Project(models.Model):
    name = models.CharField(
        max_length=300,
        verbose_name="Название проекта",
        help_text="Введите название проекта",
    )
    date_start = models.DateField(
        verbose_name="Дата начала",
        help_text="Введите дату начала проекта",
    )
    date_end = models.DateField(
        verbose_name="Дата окончания",
        help_text="Введите дату окончания проекта",
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="creator_projects",
    )

    community = models.ManyToManyField(
        User,
        related_name="projects",
        through="СommunityProject",
    )
    purpose = models.TextField(
        verbose_name="Цель проекта",
        default="Мои цели на этот проект",
    )
    tasks = models.TextField(
        verbose_name="Задачи проекта",
        default="Мои задачи на этот проект",
    )
    description = models.TextField(
        verbose_name="Описание проекта",
        default="Мои цели на этот проект",
    )

    class Meta:
        db_table = "projects_tb"
        constraints = [
            models.UniqueConstraint(
                fields=["id", "name"], name="unique name project"
            )
        ]

    def __str__(self):
        return f"<Project name:{self.name}; id:{self.id}>"

    def get_community(self):
        return self.community.all()

    def update_community(self):
        for user_in_project in self.community_info.all():
            user_in_project.update_user()

    @classmethod
    def get_project_by_name(cls, name):
        return cls.objects.filter(name=name).first()

    @classmethod
    def update_or_create_project(cls, project, update_correct_info):

        if project:
            project.name = update_correct_info["name"]
            project.date_start = update_correct_info["date_start"]
            project.date_end = update_correct_info["date_end"]
            if "purpose" in update_correct_info:
                project.purpose = update_correct_info["purpose"]
            if "tasks" in update_correct_info:
                project.tasks = update_correct_info["tasks"]
            if "description" in update_correct_info:
                project.description = update_correct_info["description"]

        else:
            project: Project = Project.objects.create(**update_correct_info)
        project.save()
        return project

    @classmethod
    def get_project_by_id(cls, id: int):
        if isinstance(id, int) or id.isdigit():
            return cls.objects.filter(id=int(id)).first()

    @classmethod
    def get_user_projects(cls, user: User):
        if user.is_superuser:
            return Project.objects.all()
        return user.projects.all()

    @staticmethod
    def get_user_rights_flag_in_project(user: User, project: "Project"):
        if user.is_superuser:
            return {"is_create": True}
        is_create = False

        user_in_community: СommunityProject = (
            СommunityProject.objects.filter(user=user)
            .filter(project=project)
            .first()
        )
        is_create = user_in_community.is_create
        # добавить права из инициативы
        return {"is_create": is_create}

    def inits_sorted(self, data, inits):
        metrics_sorted = data.get("metrics")
        inits = inits.distinct("pk")
        if metrics_sorted:
            metrics_sorted = metrics_sorted.split(",")
            inits_res: list = sorted(
                inits.all(),
                key=lambda x: abs(
                    x.metric_fields.filter(metric=metrics_sorted[0])
                )
                .first()
                .value,
                reverse=bool(int(metrics_sorted[1])),
            )
        else:
            inits_res: list = (
                inits.order_by("pk", "-date_registration").distinct("pk").all()
            )
        return inits_res

    def inits_filter_approved_roles(self, data, inits):
        roles_approved_filter = data.get("role_approv")
        if roles_approved_filter:
            roles_approved_filter = [
                item.split(",") for item in roles_approved_filter.split(";")
            ]
            if len(roles_approved_filter[-1]) == 1:
                roles_approved_filter.pop()

            for item in roles_approved_filter:
                if len(item) == 2:
                    query_properties = operator.and_(
                        (
                            Q(
                                stages_coordination__coordinator_stage__role_id=int(
                                    item[0]
                                )
                            )
                        ),
                        (Q(stages_coordination__activate=bool(int(item[1])))),
                    )

                    inits = inits.filter(query_properties)

        return inits

    def get_list_inits_after_filters_and_sorted(self, data, inits=None):
        name_filter = data.get("name", "")
        status_filter = data.get("status")
        roles_filter = data.get("roles")
        properties_filter = data.get("properties")
        files_filter = data.get("files")
        inits = inits or self.initiatives
        if name_filter:
            inits = inits.filter(name__icontains=name_filter)
        if status_filter:
            status_filter = status_filter.split(",")
            inits = inits.filter(status_id__in=status_filter)
        if roles_filter:
            roles_filter = [
                item.split(",") for item in roles_filter.split(";")
            ]
            res = {}
            for item in roles_filter:
                if len(item) == 2:
                    title, val = item
                    if title not in res:
                        res[title] = []
                    res[title].append(val)
            for title, values in res.items():
                for value in values:

                    query_role = operator.and_(
                        (Q(user_roles__user=title)),
                        (Q(user_roles__role=value)),
                    )

                    inits = inits.filter(query_role)
        if properties_filter:
            properties_filter = [
                item.split(",") for item in properties_filter.split(";")
            ]
            res = {}
            for item in properties_filter:
                if len(item) == 2:
                    title, val = item
                    if title not in res:
                        res[title] = []
                    res[title].append(val)
            for title, values in res.items():
                for value in values:
                    query_properties = operator.and_(
                        (Q(properties_fields__title=title)),
                        (Q(properties_fields__values=value)),
                    )

                    inits = inits.filter(query_properties)
            inits = inits.filter(query_properties)
        if files_filter:
            files_filter = files_filter.split(",")
            for item in files_filter:
                if item != "":

                    query_files = operator.and_(
                        (Q(files__title=item)),
                        (~Q(files__file__in=["", None])),
                    )

                    inits = inits.filter(query_files)

        inits = self.inits_filter_approved_roles(data, inits)
        # inits = inits.distinct("pk")
        return self.inits_sorted(data, inits)


class ProjectFiles(models.Model):
    id = models.AutoField(primary_key=True)
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="files",
        verbose_name="Проект",
    )
    file = models.FileField(upload_to=directory_path, null=False)
    file_name = models.CharField(max_length=250)

    @classmethod
    def add_file(cls, project: Project, file):
        return cls.objects.create(
            project=project, file=file, file_name=str(file)
        )


class IntermediateDateProject(models.Model):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="intermediate_dates",
        help_text="Проект к которому относятся промежуточные даты",
        verbose_name="Проект",
    )
    title = models.CharField(max_length=200)
    date = models.DateField(
        help_text="Введите промежуточную дату проекта",
        verbose_name="Промежуточная дата",
    )

    class Meta:
        db_table = "project_intermediate_dates"

    def __str__(self):
        return (
            f"<IntermediateDateProject title={self.title}, date={self.date}>"
        )

    @classmethod
    def create_or_update_intermediate_dates_for_project(
        cls,
        project: Project,
        update_correct_dates_info: typing.List[typing.Dict],
    ):
        cls.objects.filter(project=project).delete()
        for date_obj in update_correct_dates_info:
            cls.objects.create(
                project=project,
                title=date_obj["title"],
                date=date_obj["date"],
            )


class MetricsProject(models.Model):
    project = models.ForeignKey(
        "Project",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="metrics",
        help_text="Проект к которому относятся метрики",
        verbose_name="Проект",
    )
    description = models.TextField(
        help_text="Пояснение к метрики",
    )
    title = models.CharField(
        max_length=200,
        help_text="Введите название метрики",
        verbose_name="Метрика проекта",
    )
    value = models.FloatField(
        default=0,
        help_text="Введите текущий эффект",
        verbose_name="Значение метрики, текущее у проекта",
    )
    target_value = models.FloatField(
        help_text="Введите целевой эффект",
        verbose_name="Значение метрики, которон мы ждем от итога проекта",
    )
    units = models.CharField(
        help_text="Введите единицы измерения метрики",
        verbose_name="Единицы измерения метрики",
        max_length=200,
    )
    active = models.BooleanField(
        help_text="Нужно ли выводить метрику для всего проекта",
    )
    is_aggregate = models.BooleanField(
        help_text="Метрика является агрегированной"
    )
    is_percent = models.BooleanField(help_text="Вывод в процентах")
    initiative_activate = models.BooleanField(
        default=True,
        help_text="Нужно ли выводить метрику в реестре инициатив",
    )

    class Meta:
        db_table = "project_metrics"

    def __str__(self):
        return f"<MetricsProject title={self.title}>"

    @classmethod
    def get_metric_by_title(cls, project, title):
        return cls.objects.filter(title=title).filter(project=project).first()

    @classmethod
    def get_metric_by_id(cls, id):
        return cls.objects.filter(id=id).first()

    @classmethod
    def create_metrics_name_for_project(
        cls, project: Project, metrics: typing.List[str]
    ):
        ids_not_delete = []
        for metric_info in metrics:
            m_id = metric_info.get("id")
            if m_id and m_id > 0:
                metric_old = cls.objects.filter(id=m_id).first()
                metric_old.title = metric_info.get("title")
                metric_old.active = metric_info["active"]
                metric_old.target_value = metric_info["target_value"]
                metric_old.units = metric_info["units"]
                metric_old.description = metric_info["description"]
                metric_old.is_aggregate = metric_info["is_aggregate"]
                metric_old.is_percent = metric_info["is_percent"]
                metric_old.save()
            else:
                metric_old = cls.objects.create(
                    project=project,
                    title=metric_info["title"],
                    active=metric_info["active"],
                    target_value=metric_info["target_value"],
                    units=metric_info["units"],
                    description=metric_info.get("description"),
                    is_aggregate=metric_info.get("is_aggregate"),
                    is_percent=metric_info.get("is_percent"),
                )
            metric_info["id"] = metric_old.id
            ids_not_delete.append(metric_old.id)
        cls.objects.filter(project=project).exclude(
            id__in=ids_not_delete
        ).delete()

    @classmethod
    def add_delta_value(cls, metric_project_id, delta):
        m = MetricsProject.get_metric_by_id(metric_project_id)
        m.value += float(delta)
        m.save()


class PropertiesItemsProject(models.Model):
    propertie = models.ForeignKey(
        "PropertiesProject",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="items",
        help_text="Введите название свойтсва",
        verbose_name="Значение свойства",
    )
    value = models.CharField(
        max_length=200,
        help_text="Введите возможное значение свойства",
        verbose_name="Значение свойства",
    )

    value_short = models.CharField(
        max_length=10,
        help_text="Сокращение для графиков",
        verbose_name="Сокращение значения свойства",
        default="",
        blank=True,
    )

    class Meta:
        db_table = "properties_item"

    def __str__(self):
        return f"<PropertiesItemsProject values={self.value}>"

    @classmethod
    def get_property_item_by_id(cls, id):
        return cls.objects.filter(id=id).first()

    @classmethod
    def get_property_item_by_title(cls, propertie, value):
        return (
            cls.objects.filter(propertie=propertie).filter(value=value).first()
        )

    @classmethod
    def update_properties_values_for_project(
        cls,
        propertie,
        values: typing.List[str],
    ):
        ids_not_delete = []
        for val in values:
            id = val.get("id")
            value_short = (
                val.get("value_short")
                or val.get("value")[: min(len(val.get("value")), 4)]
            )
            if id and id > 0:
                val_obj = cls.get_property_item_by_id(id)
                val_obj.value = val.get("value")
                val_obj.value_short = value_short
                val_obj.save()
            else:
                val_obj = cls.objects.create(
                    propertie=propertie,
                    value=val.get("value"),
                    value_short=value_short,
                )
            ids_not_delete.append(val_obj.id)
            val["id"] = val_obj.id
        cls.objects.filter(propertie=propertie).exclude(
            id__in=ids_not_delete
        ).delete()


class PropertiesProject(models.Model):
    project = models.ForeignKey(
        "Project",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="properties",
        help_text="Проект к которому относятся свойства",
        verbose_name="Проект",
    )
    title = models.CharField(
        max_length=200,
        verbose_name="Название свойства",
        help_text="Введите название свойства",
    )
    initiative_activate = models.BooleanField(default=True)
    is_community_activate = models.BooleanField(
        help_text="В сообществе емкость актуальна, например подразделения",
        default=True,
    )

    class Meta:
        db_table = "project_properties"

    def __str__(self):
        return f"<PropertiesProject title={self.title}>"

    @classmethod
    def get_property_by_title(cls, project, title):
        return cls.objects.filter(project=project).filter(title=title).first()

    @classmethod
    def get_property_by_id(cls, id):
        return cls.objects.filter(id=id).first()

    @classmethod
    def update_properties_for_project(
        cls, project, properties: typing.List[typing.Dict]
    ):
        ids_not_delete = []
        properties_obj = []
        for p in properties:
            id = p.get("id")
            if id and id > 0:
                propertie = cls.get_property_by_id(id)
                propertie.title = p.get("title")
                propertie.save()
            else:
                propertie = cls.objects.create(
                    project=project,
                    title=p["title"],
                )
                PropertiesСommunityProject.create_new_propertie_in_community(
                    project, propertie
                )
            properties_obj.append(propertie)
            ids_not_delete.append(propertie.id)

            PropertiesItemsProject.update_properties_values_for_project(
                propertie=propertie, values=p["values"]
            )
            p["id"] = p.get("id")
        cls.objects.filter(project=project).exclude(
            id__in=ids_not_delete
        ).delete()
        return properties_obj


class СommunityProject(models.Model):
    project = models.ForeignKey(
        "Project",
        on_delete=models.CASCADE,
        related_name="community_info",
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
    )
    is_create = models.BooleanField(
        default=False,
        help_text="Возможность созданияиния инциативы",
    )
    is_author = models.BooleanField(
        default=False,
        help_text="Флаг автора",
    )

    date_create = models.DateField(
        verbose_name="Дата создания проекта",
        default=timezone.now,
    )

    class Meta:
        db_table = "community_tb"
        ordering = ["date_create"]

    def __str__(self):
        return f"<СommunityProject project={self.project.name} person={self.user.email}>"

    def update_user(self, value=""):
        for (
            community_settings_add_field
        ) in self.project.community_settings.all():
            title = community_settings_add_field
            add_filid_obj = (
                CommunityAddFields.objects.filter(title=title)
                .filter(community=self)
                .first()
            )
            if not add_filid_obj:
                CommunityAddFields.objects.create(
                    title=title, community=self, value=value
                )

    @classmethod
    def create_or_update_user_in_community(
        cls,
        project: Project,
        user: User,
        is_create: bool,
        is_author: bool = False,
    ):
        defaults = {
            "is_create": is_create,
            "is_author": is_author,
        }
        obj, flag = cls.objects.update_or_create(
            project=project, user=user, defaults=defaults
        )
        return obj


class CommunitySettingsAddFields(models.Model):
    project = models.ForeignKey(
        "Project",
        on_delete=models.CASCADE,
        related_name="community_settings",
    )
    title = models.CharField(
        max_length=200,
        verbose_name="Название доп поля",
        help_text="Введите навзание доп поля",
    )

    @classmethod
    def create_or_update(cls, project, data):
        ids_not_delete = []
        for item in data:
            id = item.get("id")
            if id > 0:
                item_obj, _ = cls.objects.update_or_create(
                    id=item.get("id"), defaults=item
                )
            else:
                id = item.pop("id")
                item_obj = cls.objects.create(**item, project=project)
            ids_not_delete.append(item_obj.id)
            item["id"] = item_obj.id
        cls.objects.filter(project=project).exclude(
            id__in=ids_not_delete
        ).delete()


class CommunityAddFields(models.Model):
    community = models.ForeignKey(
        СommunityProject,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="addfields",
    )
    title = models.ForeignKey(
        CommunitySettingsAddFields,
        on_delete=models.CASCADE,
    )
    value = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        default="",
    )

    @classmethod
    def create_or_update_addfields_user_in_community(
        cls, community, addfields
    ):
        for field in addfields:
            cls.objects.update_or_create(
                community=community,
                title_id=field.get("title").get("id"),
                defaults={"value": field.get("value")},
            )

    class Meta:
        db_table = "community_addfields"


class PropertiesСommunityProject(models.Model):
    community = models.ForeignKey(
        СommunityProject,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="properties",
        help_text="Свойства пользователя в комманде",
        verbose_name="Свойства пользователя",
    )

    title = models.ForeignKey("PropertiesProject", on_delete=models.CASCADE)
    values = models.ManyToManyField("PropertiesItemsProject")

    class Meta:
        db_table = "propert_community_tb"

    def __str__(self):
        return f"<PropertiesСommunityProject title={self.title} value={self.values}>"

    @classmethod
    def create_new_propertie_in_community(cls, project, propertie):
        for community_user in project.community_info.all():
            cls.objects.create(community=community_user, title=propertie)

    @classmethod
    def create_or_update_properties_user_in_community(
        cls, community, properties
    ):

        ids_not_delete = []
        for prop in properties:
            title_obj = prop.get("title")
            values = prop.get("values")
            item = (
                cls.objects.filter(community=community)
                .filter(title_id=title_obj.get("id"))
                .first()
            )
            if not item:
                item = cls.objects.create(
                    community=community,
                    title_id=title_obj.get("id"),
                )
            item.values.clear()
            for right_obj in values:
                item.values.add(right_obj.get("id"))
            item.save()
            ids_not_delete.append(item.id)
        cls.objects.filter(community=community).exclude(
            id__in=ids_not_delete
        ).delete()

    @classmethod
    def create_default_properties_user_in_community(
        cls, community, properties
    ):
        for prop in properties:
            if not (
                cls.objects.filter(community=community)
                .filter(title=prop)
                .first()
            ):
                cls.objects.create(
                    community=community,
                    title=prop,
                )


class RolesProject(models.Model):
    """
    Роли проекта
    """

    project = models.ForeignKey(
        "Project",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="roles",
        help_text="Проект к которому относятся права пользователей",
        verbose_name="Проект",
    )
    name = models.CharField(max_length=200)
    initiative_activate = models.BooleanField(
        default=True,
        help_text="Нужно ли выводить метрику в реестре инициатив",
    )
    is_approve = models.BooleanField(default=False)
    is_update = models.BooleanField(default=False)

    class Meta:
        db_table = "roles_project_tb"

    @classmethod
    def get_by_id(cls, id):
        return cls.objects.filter(id=id).first()

    @classmethod
    def get_roles_by_project(cls, project):
        return cls.objects.filter(project=project).order_by("name").all()

    @classmethod
    def create_or_update(cls, project: Project, roles):
        ids_not_delete = []
        for item in roles:
            id = item.get("id")
            if id > 0:
                item_obj, _ = cls.objects.update_or_create(
                    id=item.get("id"), defaults=item
                )
            else:
                id = item.pop("id")
                item_obj = cls.objects.create(**item, project=project)
            ids_not_delete.append(item_obj.id)
            item["id"] = item_obj.id
        cls.objects.filter(project=project).exclude(
            id__in=ids_not_delete
        ).delete()


class ProjectStages(models.Model):
    """
    Этапы проекта
    """

    project = models.ForeignKey(
        "Project",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="stages",
        help_text="Проект",
        verbose_name="Проект",
    )
    name_stage = models.CharField(max_length=200)
    date_start = models.DateField(
        help_text="Введите дату начала этапа",
        verbose_name="Дата начала этапа",
    )
    date_end = models.DateField(
        help_text="Введите дату конца этапа",
        verbose_name="Дата конца этапа",
    )

    class Meta:
        db_table = "stages_project"

    @classmethod
    def create_or_update_stages_project(cls, project, list_stages: list):
        cls.objects.filter(project=project).delete()
        for new_stage in list_stages:
            cls.objects.create(project=project, **new_stage)
