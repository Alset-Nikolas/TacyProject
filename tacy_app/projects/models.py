import typing

from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


def directory_path(instance, filename):
    return "files/description/{0}/{1}".format(instance.pk, filename)


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
        verbose_name="Цель проекта", default="Мои цели на этот проект"
    )
    tasks = models.TextField(
        verbose_name="Задачи проекта", default="Мои задачи на этот проект"
    )
    description = models.TextField(
        verbose_name="Описание проекта", default="Мои цели на этот проект"
    )

    files = models.FileField(upload_to=directory_path, null=True)

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

    @classmethod
    def get_project_by_name(cls, name):
        return cls.objects.filter(name=name).first()

    @classmethod
    def update_or_create_project(cls, instanse, update_correct_info):

        if instanse:
            instanse.name = update_correct_info["name"]
            instanse.date_start = update_correct_info["date_start"]
            instanse.date_end = update_correct_info["date_end"]
            if "purpose" in update_correct_info:
                instanse.purpose = update_correct_info["purpose"]
            if "tasks" in update_correct_info:
                instanse.tasks = update_correct_info["tasks"]
            if "description" in update_correct_info:
                instanse.description = update_correct_info["description"]

        else:

            instanse: Project = Project.objects.create(**update_correct_info)
        instanse.save()
        return instanse

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
            return {"is_create": True, "is_coordinate": True, "is_watch": True}
        is_create = False
        is_coordinate = False
        is_watch = False
        for rights_list in [
            x.rights_user.all()
            for x in СommunityProject.objects.filter(user=user)
            .filter(project=project)
            .all()
        ]:
            for right in rights_list:
                flags = right.flags
                is_create = flags.is_create or is_create
                is_coordinate = flags.is_coordinate or is_coordinate
                is_watch = flags.is_watch or is_watch
        return {
            "is_create": is_create,
            "is_coordinate": is_coordinate,
            "is_watch": is_watch,
        }

    @staticmethod
    def get_bosses_in_project(project):
        bosses = []
        ids_boss = set()
        for info_community in СommunityProject.objects.filter(
            project=project
        ).all():
            user = info_community.user
            is_coordinate = Project.get_user_rights_flag_in_project(
                user, project
            ).get("is_coordinate")
            if is_coordinate and user.id not in ids_boss:
                bosses.append(user)
                ids_boss.add(user.id)
        return bosses


class IntermediateDateProject(models.Model):
    project = models.ForeignKey(
        "Project",
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
    active = models.BooleanField()
    initiative_activate = models.BooleanField(default=True)

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
            print("m_id", m_id)
            if m_id and m_id > 0:
                metric_old = cls.objects.filter(id=m_id).first()
                metric_old.title = metric_info.get("title")
                metric_old.active = metric_info["active"]
                metric_old.target_value = metric_info["target_value"]
                metric_old.units = metric_info["units"]
                metric_old.save()
            else:
                metric_old = cls.objects.create(
                    project=project,
                    title=metric_info["title"],
                    active=metric_info["active"],
                    target_value=metric_info["target_value"],
                    units=metric_info["units"],
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
            if id and id > 0:
                val_obj = cls.get_property_item_by_id(id)
                val_obj.value = val.get("value")
                val_obj.save()
            else:
                val_obj = cls.objects.create(
                    propertie=propertie,
                    value=val.get("value"),
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
            ids_not_delete.append(propertie.id)

            PropertiesItemsProject.update_properties_values_for_project(
                propertie=propertie, values=p["values"]
            )
            p["id"] = p.get("id")
        cls.objects.filter(project=project).exclude(
            id__in=ids_not_delete
        ).delete()


class СommunityProject(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        # related_name="",
    )
    project = models.ForeignKey(
        "Project", on_delete=models.CASCADE, related_name="community_info"
    )

    role_user = models.ForeignKey(
        "RolesUserInProject",
        on_delete=models.CASCADE,
    )
    rights_user = models.ManyToManyField(
        "RightsUSerInProject",
        # on_delete=models.CASCADE,
    )

    class Meta:
        db_table = "community_tb"

    def __str__(self):
        return f"<СommunityProject project={self.project.name} person={self.user.email}>"

    @classmethod
    def create_or_update_user_in_community(
        cls, project: Project, user: User, role: int, rights: list
    ):
        community = (
            cls.objects.filter(project=project).filter(user=user).first()
        )
        if not community:
            community = cls.objects.create(
                project=project,
                user=user,
                role_user_id=role,
            )
        community.rights_user.clear()
        for right_id in rights:
            community.rights_user.add(right_id)
            community.save()

        return community


class PropertiesСommunityProject(models.Model):
    community = models.ForeignKey(
        "СommunityProject",
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


class RolesUserInProject(models.Model):
    project = models.ForeignKey(
        "Project",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="roles",
        help_text="Проект к которому относятся роли",
        verbose_name="Проект",
    )
    name = models.CharField(max_length=200)
    coverage = models.IntegerField(default=0)

    class Meta:
        db_table = "roles_project_tb"

    @classmethod
    def get_roles_by_id(cls, id):
        return cls.objects.filter(id=id).first()

    @classmethod
    def create_default(cls, project: Project):
        items = [
            {
                "name": "Наблюдать",
                "coverage": 0,
            },
            {
                "name": "Эксперт по направлению",
                "coverage": 1,
            },
            {
                "name": "Функциональный эксперт",
                "coverage": 2,
            },
            {
                "name": "Дирекор",
                "coverage": 3,
            },
        ]
        ids_not_delete = []

        for item in items:
            item_obj = (
                cls.objects.filter(project=project)
                .filter(name=item["name"])
                .filter(coverage=item["coverage"])
                .first()
            )
            if not item_obj:
                item_obj = cls.objects.create(
                    project=project,
                    name=item["name"],
                    coverage=item["coverage"],
                )
            ids_not_delete.append(item_obj.id)
        cls.objects.filter(project=project).exclude(
            id__in=ids_not_delete
        ).delete()


class RightsUserBool(models.Model):
    project = models.ForeignKey("Project", on_delete=models.CASCADE)
    is_create = models.BooleanField(default=False)
    is_coordinate = models.BooleanField(default=False)
    is_watch = models.BooleanField(default=False)

    class Meta:
        db_table = "user_rights_bool_tb"


class RightsUSerInProject(models.Model):
    project = models.ForeignKey(
        "Project",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="rights",
        help_text="Проект к которому относятся права пользователей",
        verbose_name="Проект",
    )
    name = models.CharField(max_length=200)
    flags = models.ForeignKey(
        "RightsUserBool",
        on_delete=models.CASCADE,
    )

    class Meta:
        db_table = "rights_project_tb"

    @classmethod
    def get_right_by_id(cls, id):
        return cls.objects.filter(id=id).first()

    @classmethod
    def create_default(cls, project: Project):
        items = [
            {
                "name": "Создать инициативу",
                "flags": RightsUserBool.objects.create(
                    project=project,
                    is_create=True,
                    is_coordinate=False,
                    is_watch=True,
                ),
            },
            {
                "name": "Согласовать инициативу",
                "flags": RightsUserBool.objects.create(
                    project=project,
                    is_create=False,
                    is_coordinate=True,
                    is_watch=True,
                ),
            },
            {
                "name": "Просмотр",
                "flags": RightsUserBool.objects.create(
                    project=project,
                    is_create=False,
                    is_coordinate=False,
                    is_watch=True,
                ),
            },
        ]
        ids_not_delete = []
        for item in items:
            item_obj = (
                cls.objects.filter(project=project)
                .filter(name=item["name"])
                .first()
            )
            if not item_obj:
                item_obj = cls.objects.create(
                    project=project, name=item["name"], flags=item["flags"]
                )

            ids_not_delete.append(item_obj.id)
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
