from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.core.mail import EmailMultiAlternatives
from rest_framework import serializers

from .models import (
    MetricsProject,
    Project,
    ProjectStages,
    PropertiesItemsProject,
    PropertiesProject,
    PropertiesСommunityProject,
    RightsUSerInProject,
    RolesUserInProject,
    СommunityProject,
)
from notifications.email import EmailManage
from notifications.models import NotificationsUser
from coordination.models import StagesCoordinationInitiative

User = get_user_model()


class IntermediateDateSerializer(serializers.Serializer):
    """
    Промежуточная дата проект
    """

    title = serializers.CharField(
        label="title",
        write_only=True,
    )
    date = serializers.DateField(
        label="date",
    )


class IntermediateDatesSerializer(serializers.Serializer):
    """
    Список промежуточных дат проект
    """

    intermediate_dates = IntermediateDateSerializer(many=True)


class PropertieSerializer(serializers.Serializer):
    """
    Свойство проекта
    """

    title = serializers.CharField(
        label="title",
        write_only=True,
    )
    values = serializers.ListField(
        child=serializers.CharField(
            label="values",
        )
    )


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

    class Meta:
        model = MetricsProject
        fields = (
            "id",
            "title",
            "value",
            "target_value",
            "units",
            "active",
        )


class CreateProjectSerializer(serializers.ModelSerializer):
    """
    Создание проекта
    """

    id = serializers.IntegerField()
    intermediate_dates = IntermediateDateSerializer(many=True)
    stages = ProjectStagesSerializer(many=True)
    metrics = MetrcsProjectSerializer(many=True)
    properties = PropertieSerializer(many=True)

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

    def validate(self, attrs):
        super().validate(attrs)
        self._validate_intermediate_dates(attrs)
        request = self.context.get("request")
        self._validate_stages(attrs)
        self._validate_main_dates(attrs)
        self._validate_uniq_name(attrs)
        self._validate_update_exist_project(attrs)
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

        instanse = (
            Project.get_project_by_id(validated_data["id"])
            if validated_data["id"] > 0
            else None
        )
        project: Project = Project.update_or_create_project(
            instanse=instanse, update_correct_info=project_info
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
            "files",
            "intermediate_dates",
            "stages",
            "metrics",
            "properties",
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
            "roles",
            "rights",
            "metrics",
            "stages",
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


class RoleUSerSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()

    class Meta:
        depth = 1
        model = RolesUserInProject
        fields = (
            "id",
            "name",
        )

    def validate(self, data):
        print("RoleUSerSerializer data", data)
        role_user_obj = RolesUserInProject.get_roles_by_id(id=data["id"])
        if not role_user_obj:
            raise serializers.ValidationError(
                {
                    "role_user id": "check role_user. There are no such values (role_user) in the database. Obj not exist RolesUserInProject",
                    "msg_er": "Такой роли у пользователя не может быть.",
                }
            )
        if role_user_obj.name != data["name"]:
            raise serializers.ValidationError(
                {
                    "role_user name": f"check role_user. role with pk={data['id']} -> name=={role_user_obj.name}, you get name={data['name']}",
                    "msg_er": "Навзание роли не соотвествует id.",
                }
            )

        return data


class RightsUserSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()

    class Meta:
        depth = 1
        model = RightsUSerInProject
        fields = (
            "id",
            "name",
        )

    def validate(self, data):
        print("data RightsUserSerializer", data)
        right_user_obj = RightsUSerInProject.get_right_by_id(id=data["id"])
        if not right_user_obj:
            raise serializers.ValidationError(
                {
                    "rights_user id": "check  rights_user. There are no such values (rights_user) in the database. Obj not exist RightsUSerInProject.",
                    "msg_er": "Таких прав у пользователя не может быть.",
                }
            )
        if right_user_obj.name != data["name"]:
            raise serializers.ValidationError(
                {
                    "rights_user name": f"check rights_user. ights with pk={data['id']} -> name=={right_user_obj.name}, you get name={data['name']}",
                    "msg_er": "Название прав пользователя не соответсвует id.",
                }
            )

        return data


class PropertiesProjectSerializer(serializers.Serializer):
    id = serializers.IntegerField()

    def validate_id(self, id):
        print("PropertiesProjecttSerializer", id)
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


class PropertiesItemsProjectSerializer(serializers.Serializer):
    id = serializers.IntegerField()


class ProperitsUserSerializer(serializers.Serializer):
    title = PropertiesProjectSerializer()
    values = PropertiesItemsProjectSerializer(many=True)

    def validate(self, data):
        print("data ProperitsUserSerializer", data)
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
    role_user = RoleUSerSerializer()
    rights_user = RightsUserSerializer(many=True)
    properties = ProperitsUserSerializer(many=True)

    class Meta:
        depth = 1
        model = СommunityProject
        fields = ("user", "role_user", "rights_user", "properties")

    def validate(self, data):
        print("data CommunityInfoSerializer", data)
        # super().validate(data)

        project = self.context.get("project")
        role_user_obj = RolesUserInProject.get_roles_by_id(
            id=data["role_user"]["id"]
        )

        if role_user_obj.project != project:
            raise serializers.ValidationError(
                {
                    "role_user": f"The project does not have such roles: your project {project}, this role belongs project pk={role_user_obj.project}",
                    "msg_er": "Таких ролей нет в этом проекте.",
                }
            )
        for right_user in data["rights_user"]:
            right_user_obj = RightsUSerInProject.get_right_by_id(
                right_user["id"]
            )
            if right_user_obj.project != project:
                raise serializers.ValidationError(
                    {
                        "rights_user": f"The project does not have such right: your project {project}, this right belongs project {right_user_obj.project}",
                        "msg_er": "Таких прав нет в этом проекте.",
                    }
                )
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
        for user_obj in validated_data["community_info"]:
            user_info = user_obj["user"]
            user: User = User.get_user_by_email(user_info["email"])
            new_account = bool(not user)
            print("user_info", user_info)
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

            role_id = user_obj["role_user"]["id"]
            right_ids = [x["id"] for x in user_obj["rights_user"]]
            community_item = (
                СommunityProject.create_or_update_user_in_community(
                    project, user, role_id, right_ids
                )
            )
            community_ids_not_del.append(community_item.id)
            PropertiesСommunityProject.create_or_update_properties_user_in_community(
                community_item, user_obj["properties"]
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
    role = serializers.IntegerField(
        label="role",
        write_only=True,
        required=True,
    )
    right = serializers.IntegerField(
        label="right",
        write_only=True,
        required=True,
    )

    def validate_role(self, role):
        if not RolesUserInProject.objects.filter(pk=role).first():
            raise serializers.ValidationError(
                {
                    "role": f"Not exist role pk {role}",
                    "msg_er": "Такой роли нет.",
                }
            )
        return role

    def validate_right(self, right):
        if not RightsUSerInProject.objects.filter(pk=right).first():
            raise serializers.ValidationError(
                {
                    "right": f"Not exist right pk {right}",
                    "msg_er": "Таких прав нет.",
                }
            )
        return right


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
