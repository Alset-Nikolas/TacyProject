from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.core.mail import EmailMultiAlternatives
from rest_framework import serializers

from .models import (
    MetricsProject,
    Project,
    ProjectFiles,
    ProjectStages,
    PropertiesItemsProject,
    PropertiesProject,
    PropertiesСommunityProject,
    СommunityProject,
    RolesProject,
    IntermediateDateProject,
)
from notifications.email import EmailManage
from notifications.models import NotificationsUser
from coordination.models import StagesCoordinationInitiative

User = get_user_model()


class IntermediateDateSerializer(serializers.ModelSerializer):
    """
    Промежуточная дата проект
    """

    class Meta:
        model = IntermediateDateProject
        fields = (
            "title",
            "date",
        )


class IntermediateDatesSerializer(serializers.Serializer):
    """
    Список промежуточных дат проект
    """

    intermediate_dates = IntermediateDateSerializer(many=True)


class PropertiesItemsProjectSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()

    class Meta:
        model = PropertiesItemsProject
        fields = (
            "id",
            "value",
            "value_short",
        )

    def validate_id(self, id):

        if id > 0 and not PropertiesItemsProject.get_property_item_by_id(id):
            raise serializers.ValidationError(
                {
                    "id": "id not exist",
                    "msg_er": "Свойств с таким id не существует",
                }
            )
        return id


class PropertieSerializer(serializers.Serializer):
    """
    Свойство проекта
    """

    id = serializers.IntegerField()
    title = serializers.CharField(
        label="title",
        write_only=True,
    )
    values = PropertiesItemsProjectSerializer(many=True)

    def validate_id(self, id):
        if id > 0 and not PropertiesProject.get_property_by_id(id):
            raise serializers.ValidationError(
                {
                    "id ": "id not exist",
                    "msg_er": "Таких свойств в базе нету",
                }
            )
        return id


class RolesProjectSerializer(serializers.ModelSerializer):
    """
    Все возможные права проекта
    """

    id = serializers.IntegerField()

    class Meta:
        model = RolesProject
        fields = (
            "id",
            "name",
            "is_approve",
            "is_update",
        )

        # read_only_fields = ["name", "is_approve", "is_update"]

    def validate_id(self, id):
        if id > 0 and not RolesProject.get_by_id(id):
            raise serializers.ValidationError(
                {
                    "id ": "id not exist",
                    "msg_er": "Таких ролей в базе нету",
                }
            )
        return id


class ProjectStagesSerializer(serializers.ModelSerializer):
    """
    Этап проекта
    """

    class Meta:
        model = ProjectStages
        fields = (
            "name_stage",
            "date_start",
            "date_end",
        )

    def validate(self, data):
        if data["date_start"] > data["date_end"]:
            raise serializers.ValidationError(
                {
                    "(date_start, date_end) ": "date_start <= date_end",
                    "msg_er": "Дата создания проекта не может быть раньше даты окончания.",
                }
            )
        return data


class MetrcsProjectSerializer(serializers.ModelSerializer):
    """
    Метрика проекта
    """

    id = serializers.IntegerField()

    class Meta:
        model = MetricsProject
        fields = (
            "id",
            "title",
            "value",
            "target_value",
            "units",
            "active",
            "description",
            "is_aggregate",
            "is_percent",
        )

    def validate_id(self, id):
        if id > 0:
            if not MetricsProject.get_metric_by_id(id):
                raise serializers.ValidationError(
                    {
                        "id ": "id not exist",
                        "msg_er": "Метрики с таким idв базе нет",
                    }
                )
        return super().validate(id)


class CreateProjectSerializer(serializers.ModelSerializer):
    """
    Создание проекта
    """

    id = serializers.IntegerField()
    intermediate_dates = IntermediateDateSerializer(
        many=True, required=False, default=[]
    )
    stages = ProjectStagesSerializer(many=True, default=[])
    metrics = MetrcsProjectSerializer(many=True, required=False, default=[])
    properties = PropertieSerializer(many=True, required=False, default=[])
    roles = RolesProjectSerializer(many=True, required=False, default=[])

    def _validate_intermediate_dates(self, attrs):
        if "intermediate_dates" in attrs and attrs["intermediate_dates"]:
            if (
                attrs["intermediate_dates"][0]["date"] < attrs["date_start"]
                or attrs["date_end"] < attrs["intermediate_dates"][-1]["date"]
            ):
                raise serializers.ValidationError(
                    {
                        "intermediate_dates": "date_start <= intermediate_dates <= date_end",
                        "msg_er": "Промежуточные даты должны начинаться не раньше 'Даты создания проекта' и не позже 'Даты конца проекта'",
                    }
                )

    def _validate_stages(self, attrs):
        if "stages" in attrs and attrs["stages"]:
            min_date = min(x["date_start"] for x in attrs["stages"])
            max_date = max(x["date_end"] for x in attrs["stages"])
            if min_date < attrs["date_start"] or max_date > attrs["date_end"]:
                raise serializers.ValidationError(
                    {
                        "stages": "date_start_project <= stages_dates <= date_end_project",
                        "msg_er": "Этапы проекта не могут начинаться раньше 'Даты создания проекта' и закончится позже 'Даты конца проекта'",
                    }
                )

    def _validate_main_dates(self, attrs):
        if attrs["date_start"] > attrs["date_end"]:
            raise serializers.ValidationError(
                {
                    "date_start <= date_end": "date_start_project <= date_end",
                    "msg_er": "Дата конца проекта не может быть раньше начала.",
                }
            )

    def _validate_uniq_name(self, attrs):
        if attrs["id"] <= 0 and Project.get_project_by_name(attrs["name"]):
            raise serializers.ValidationError(
                {
                    "name": "name project already exist",
                    "msg_er": "Такое имя проекта уже кем-то используется.",
                }
            )
        if attrs["id"] > 0:
            pr = Project.get_project_by_id(attrs["id"])
            if not pr:
                raise serializers.ValidationError(
                    {
                        "id": "id not exist",
                        "msg_er": "С таким id не существует в базе",
                    }
                )
            if pr.name != attrs["name"] and Project.get_project_by_name(
                attrs["name"]
            ):
                raise serializers.ValidationError(
                    {
                        "name": "name project already exist",
                        "msg_er": "Такое имя проекта уже кем-то используется.",
                    }
                )

    def _validate_update_exist_project(self, attrs):
        if attrs["id"] > 0 and not Project.get_project_by_id(attrs["id"]):
            raise serializers.ValidationError(
                {
                    "id": "id project not exist",
                    "msg_er": "Проект с таким id не найден",
                }
            )

    def _validate_update_metrics_project(self, attrs):
        if attrs["id"] > 0:
            project = Project.get_project_by_id(attrs["id"])
            for m in attrs.get("metrics", []):
                m_obj = MetricsProject.get_metric_by_id(m.get("id", -1))
                if m_obj:
                    if m_obj.project != project:
                        raise serializers.ValidationError(
                            {
                                "metrics": "id metrics error",
                                "msg_er": "Не соответвует id метрики и id проекты",
                                "details": f"id error {m.get('id')}",
                            }
                        )
                    m_problem = MetricsProject.get_metric_by_title(
                        project, m_obj.title
                    )
                    if m_problem != m_obj:
                        raise serializers.ValidationError(
                            {
                                "metric name": "name metrics error",
                                "msg_er": "Название метрик уникально в рамках проекта",
                                "details": f"name problem {m_obj.title}",
                            }
                        )

    def __validate_update_propertie_value_project(self, values):
        unique = set()
        for p_item in values:
            id_item = p_item.get("id")
            value = p_item.get("value")
            unique.add(value)
            if id_item > 0:
                p_item_obj = PropertiesItemsProject.get_property_item_by_id(
                    id_item
                )
                if not p_item_obj:
                    raise serializers.ValidationError(
                        {
                            "properties value id": "id value properie error",
                            "msg_er": "Нету с таким id обьекта",
                            "details": f"title problem {value}",
                        }
                    )

        if len(unique) != len(values):
            raise serializers.ValidationError(
                {
                    "properties value title": "title value properie error",
                    "msg_er": "Название значений в емкости уникальны",
                }
            )

    def _validate_update_propertie_project(self, attrs):
        project = Project.get_project_by_id(attrs.get("id", -1))
        unique = set()
        properties = attrs.get("properties", [])
        for p in properties:
            if project:
                p_obj = PropertiesProject.get_property_by_id(p.get("id", -1))
                if p_obj and p_obj.project != project:
                    raise serializers.ValidationError(
                        {
                            "properties": "id properties error",
                            "msg_er": "Не соответвует id свойства и id проекты",
                            "details": f"id error {p.get('id')}",
                        }
                    )
                self.__validate_update_propertie_value_project(p.get("values"))
            unique.add(p.get("title"))
        if len(unique) != len(properties):
            raise serializers.ValidationError(
                {
                    "properties title": "title value properie error",
                    "msg_er": "Название емкостей уникальны в рамках проекта",
                }
            )

    def validate(self, attrs):
        super().validate(attrs)
        self._validate_intermediate_dates(attrs)
        request = self.context.get("request")
        self._validate_stages(attrs)
        self._validate_main_dates(attrs)
        self._validate_uniq_name(attrs)
        self._validate_update_exist_project(attrs)
        self._validate_update_metrics_project(attrs)
        self._validate_update_propertie_project(attrs)
        attrs["author"] = request.user
        return attrs

    def create_or_update(self, validated_data):
        project_info = dict()
        for x in [
            "name",
            "date_start",
            "date_end",
            "author",
            "purpose",
            "tasks",
            "description",
        ]:
            project_info[x] = validated_data[x]

        instance = (
            Project.get_project_by_id(validated_data["id"])
            if validated_data["id"] > 0
            else None
        )
        project: Project = Project.update_or_create_project(
            project=instance,
            update_correct_info=project_info,
        )

        user = project_info["author"]
        user.project_active = project
        user.save()
        return project

    class Meta:
        model = Project
        fields = (
            "id",
            "name",
            "date_start",
            "date_end",
            "purpose",
            "tasks",
            "description",
            "intermediate_dates",
            "stages",
            "metrics",
            "properties",
            "roles",
        )


class PropertiesSerializer(serializers.ModelSerializer):
    """
    Свойство проекта
    """

    class Meta:
        depth = 1
        model = PropertiesProject
        fields = [
            "id",
            "title",
            "items",
        ]


class InfoProjectSerializer(serializers.ModelSerializer):
    properties = PropertiesSerializer(many=True)
    metrics = MetrcsProjectSerializer(many=True)
    roles = RolesProjectSerializer(many=True)

    class Meta:
        model = Project
        depth = 1
        fields = [
            "id",
            "name",
            "date_start",
            "date_end",
            "purpose",
            "tasks",
            "description",
            "intermediate_dates",
            "properties",
            "metrics",
            "stages",
            "roles",
            "files",
        ]


class UserProjectIdSerializer(serializers.Serializer):
    id = serializers.IntegerField()

    def validate_id(self, id):
        if not Project.objects.filter(id=id).first():
            raise serializers.ValidationError(f"project pk = {id} not exist")
        project = Project.get_project_by_id(id)
        user = self.context.get("user")
        if project not in Project.get_user_projects(user):
            raise serializers.ValidationError(
                {
                    "id": f"user {user.pk} not working in project pk={project.pk}",
                    "msg_er": "В этот проект Вас не приглашали",
                }
            )
        return id


class UserBaseSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    email = serializers.EmailField()

    class Meta:
        depth = 1
        model = User
        fields = (
            "id",
            "first_name",
            "last_name",
            "second_name",
            "email",
            "phone",
        )


class PropertiesProjectSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()

    class Meta:
        model = PropertiesProject
        fields = ("id", "title")

    def validate_id(self, id):
        project = self.context.get("project")
        p_name_obj = PropertiesProject.get_property_by_id(id=id)
        if not p_name_obj:
            raise serializers.ValidationError(
                {
                    "properties title_id": "check properties title_id. Obj not exist PropertiesProject",
                    "msg_er": "Таких навзваний емкостей (свойств) у проекта не может быть.",
                }
            )
        if p_name_obj.project != project:
            raise serializers.ValidationError(
                {
                    "properties title_id": f"The project does not have such properties title_id: your project {project}, this properties title_id belongs project {p_name_obj.project}",
                    "msg_er": "Название емкости (свойства) в текущем проекте нет",
                }
            )
        return id


class PropertiesItemsIdProjectSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()

    class Meta:
        model = PropertiesItemsProject
        fields = ("id", "value")


class ProperitsUserSerializer(serializers.Serializer):
    title = PropertiesProjectSerializer()
    values = PropertiesItemsIdProjectSerializer(many=True)

    def validate(self, data):
        propert_obj = data["title"]
        p_name_obj = PropertiesProject.get_property_by_id(
            id=propert_obj.get("id")
        )

        for value_obj in data["values"]:

            p_value_obj = PropertiesItemsProject.get_property_item_by_id(
                id=value_obj.get("id")
            )
            if not p_value_obj:
                raise serializers.ValidationError(
                    {
                        "properties value_id": "check properties value_id. Obj not exist PropertiesProject",
                        "msg_er": "Таких значений емкостей (свойств) у проекта не может быть.",
                    }
                )

            if p_value_obj.propertie != p_name_obj:
                raise serializers.ValidationError(
                    {
                        "properties value_id": "not valid combination (title_id, value_id)",
                        "msg_er": "Значение емкости (свойства) не соответсвует названию.",
                    }
                )
        return data


class CommunityInfoSerializer(serializers.ModelSerializer):
    user = UserBaseSerializer()
    properties = ProperitsUserSerializer(many=True)

    class Meta:
        depth = 1
        model = СommunityProject
        fields = (
            "user",
            "is_create",
            "properties",
            "is_author",
            "date_create",
        )

    def validate(self, data):
        project = self.context.get("project")
        all_properties_in_project = project.properties.all()
        if len(all_properties_in_project) != len(data["properties"]):
            raise serializers.ValidationError(
                {
                    "properties": f"The all properties required: in project len(properties)={len(all_properties_in_project)}, you get len(properties)={len(data['properties'])}",
                    "msg_er": "Все емкости должны быть заполнены. Кол-во у проекта и в запросе не совпадают",
                }
            )
        return data


class UpdateCommunityProjectSerializer(serializers.ModelSerializer):
    community_info = CommunityInfoSerializer(many=True)

    class Meta:
        depth = 1
        model = Project

        fields = ("community_info",)

    def create_community(self, validated_data):
        project = self.context.get("project")
        community_ids_not_del = []
        for community_obj in validated_data["community_info"]:
            user_info = community_obj["user"]
            user: User = User.get_user_by_email(user_info["email"])
            new_account = bool(not user)
            if not new_account and (
                project not in Project.get_user_projects(user)
            ):
                EmailManage.send_invitation_new_project(
                    user=user, context={"project": project}
                )
                NotificationsUser.create(
                    user=user,
                    text=f"Вас пригласили в новый проект '{project.name}'",
                )

            user: User = User.create_or_update_user(project, user_info)
            if new_account:
                EmailManage.send_invitation_new_account(
                    user=user, context={"project": project}
                )
                NotificationsUser.create(
                    user=user,
                    text=f"Добро пожаловать в приложение {settings.SITE_FULL_NAME}. Это ваш первый проект '{project.name}'",
                )

            community_item = (
                СommunityProject.create_or_update_user_in_community(
                    project,
                    user,
                    community_obj.get("is_create"),
                    project.author == user,
                )
            )
            community_ids_not_del.append(community_item.id)
            PropertiesСommunityProject.create_or_update_properties_user_in_community(
                community_item, community_obj["properties"]
            )
        for del_person in (
            СommunityProject.objects.filter(project=project)
            .exclude(id__in=community_ids_not_del)
            .all()
        ):
            EmailManage.send_removed_in_project(
                del_person.user, context={"project": project}
            )
            NotificationsUser.create(
                user=del_person.user,
                text=f"Спасибо что учавствовали в проекте {project.name}",
            )
            StagesCoordinationInitiative.delete_user_in_project(
                project, del_person.user
            )
            del_person.delete()


class PropertiesUserSerializer(serializers.Serializer):

    right = serializers.IntegerField(
        label="right",
        write_only=True,
        required=True,
    )


class CommunitySerializer(serializers.Serializer):
    user = UserBaseSerializer()
    properties = PropertiesUserSerializer()

    def create(self, validated_data):
        user_info: dict = validated_data["user"]
        project = self.context.get("project")
        user = User.create_or_update_user(project, user_info)
        СommunityProject.create_or_update_user_in_community(
            user=user, project=project, properties=validated_data["properties"]
        )
        return user


class UpdateDatesProjectSerializer(serializers.Serializer):
    user = UserBaseSerializer()
    properties = PropertiesUserSerializer()


class MinInfoProject(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ("id", "name")


class ListProjecttSerializer(serializers.Serializer):
    items = MinInfoProject(many=True)


class ProjectFilesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectFiles
        fields = "__all__"


class ProjectFilesIdSerializer(serializers.Serializer):
    id = serializers.IntegerField()

    def validate_id(self, id):
        project = self.context.get("project")
        file = ProjectFiles.objects.filter(id=id).first()
        if not file:
            raise serializers.ValidationError({"id file not exist"})
        if file.project != project:
            raise serializers.ValidationError(
                {"file.project != get param project"}
            )
        return id
