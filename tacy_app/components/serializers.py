from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.core.mail import EmailMultiAlternatives
from rest_framework import serializers
from .models import (
    Initiatives,
    SettingsAddFeldsInitiative,
    SettingsAddFeldsEvent,
    Events,
    Risks,
    SettingsAddFeldsRisks,
    SettingsStatusInitiative,
    SettingsComponents,
    InitiativesAddFields,
    RisksAddFields,
    EventsAddFields,
    InitiativesPropertiesFields,
    PropertiesItemsProject,
    InitiativesMetricsFields,
    EventMetricsFields,
    SettingsStatusInitiative,
    RolesUserInInitiative,
    RolesProject,
    SettingsFilesInitiative,
    InitiativesFiles,
)
from projects.models import (
    PropertiesProject,
    MetricsProject,
    Project,
    СommunityProject,
)
from django.shortcuts import get_object_or_404
from users.serializers import UserBaseSerializer
import xlsxwriter
import os
from projects.serializers import ProperitsUserSerializer

User = get_user_model()


class AddFeldsInitiativesSerializer(serializers.ModelSerializer):
    """
    Серилизатор дополнительных полей инициативы
    """

    class Meta:
        # depth = 1
        model = SettingsAddFeldsInitiative
        fields = ["title", "type"]


class AddFeldsEventsSerializer(serializers.ModelSerializer):
    class Meta:
        # depth = 1
        model = SettingsAddFeldsEvent
        fields = ["title", "type"]


class AddFeldsRisksSerializer(serializers.ModelSerializer):
    class Meta:
        # depth = 1
        model = SettingsAddFeldsRisks
        fields = ["title", "type"]


class StatusInitiativeSerializer(serializers.ModelSerializer):
    value = serializers.IntegerField()

    class Meta:
        # depth = 1
        model = SettingsStatusInitiative
        fields = ["name", "value"]

    def validate_value(self, value):
        if value < 0:
            raise serializers.ValidationError("value > 0")
        return super().validate(value)


class PropertiesProjectActiveSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()

    class Meta:
        model = PropertiesProject
        fields = ["id", "title", "initiative_activate"]

    def validate_id(self, id):
        project = self.context.get("project")
        property_ = PropertiesProject.get_property_by_id(id)
        if not property_:
            raise serializers.ValidationError(
                {
                    "id": f"id not exist",
                    "msg_er": "Емкость (свойство) с таким id не существует",
                }
            )
        return id


class PropertiesProjectActiveSerializerInfo(serializers.ModelSerializer):
    id = serializers.IntegerField()

    class Meta:
        depth = 1
        model = PropertiesProject
        fields = ["id", "title", "initiative_activate", "items"]

    def validate_id(self, id):
        project = self.context.get("project")
        property_ = PropertiesProject.get_property_by_id(id)
        if not property_:
            raise serializers.ValidationError(
                {
                    "id": f"id not exist",
                    "msg_er": "Емкость (свойство) с таким id не существует",
                }
            )
        return id


class MetricsProjectActiveSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()

    class Meta:
        model = MetricsProject
        fields = ["id", "title", "initiative_activate", "units"]

    def validate_id(self, id):
        metrics = MetricsProject.get_metric_by_id(id)
        if not metrics:
            raise serializers.ValidationError(
                {
                    "id": f"id not exist",
                    "msg_er": "Метрика с таким id не существует",
                }
            )
        return id


class TableRegistrySerializer(serializers.Serializer):
    properties = PropertiesProjectActiveSerializer(many=True)
    metrics = MetricsProjectActiveSerializer(many=True)


class TableRegistrySerializerInfo(serializers.Serializer):
    properties = PropertiesProjectActiveSerializerInfo(many=True)
    metrics = MetricsProjectActiveSerializer(many=True)


class SettingsInitiativesSerializer(serializers.ModelSerializer):
    # initiative_addfields = SettingsAddFeldsInitiativeSerializer(many=True)

    class Meta:
        model = SettingsComponents
        fields = "__all__"
        # fields = [
        #     "id",
        #     # "initiative_status",
        #     "initiative_addfields",
        #     # "event_addfields",
        #     # "risks_addfields",
        # ]


class AddFieldsInitiativeTitleSettingSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()

    class Meta:
        model = SettingsAddFeldsInitiative
        fields = ["id", "title", "type"]


class AddFieldsInitiativeSerializer(serializers.ModelSerializer):
    title = AddFieldsInitiativeTitleSettingSerializer()

    class Meta:
        depth = 1
        model = InitiativesAddFields
        fields = ["id", "value", "title"]


class StatusInitiativeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SettingsStatusInitiative
        fields = "__all__"


class MainInitiativeSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()
    status = StatusInitiativeSerializer(required=False)

    class Meta:
        model = Initiatives
        fields = [
            "id",
            "project",
            "author",
            "name",
            "current_state",
            "reasons",
            "description",
            "date_start",
            "date_end",
            "date_registration",
            "status",
        ]
        read_only_fields = ["author"]

    def validate(self, attrs):
        id = attrs.get("id")
        project = attrs.get("project")
        self.context["project"] = project
        name = attrs.get("name")
        if id < 0:
            initiative = Initiatives.get_by_name(
                project,
                name,
            )
            if initiative:
                raise serializers.ValidationError(
                    {
                        "name": f"initiative in project already exist",
                        "msg_er": "Инициатива с таким названием у данного проекта уже создана",
                    }
                )
        else:
            initiative_update = Initiatives.get_by_id(id)
            initiative_old_name = Initiatives.get_by_name(
                project,
                name,
            )
            if not initiative_update:
                raise serializers.ValidationError(
                    {
                        "id": f"initiative not exist",
                        "msg_er": "Инициативы с таким id не существует",
                    }
                )

            if initiative_old_name and (
                initiative_old_name.id != initiative_update.id
            ):
                raise serializers.ValidationError(
                    {
                        "name": f"initiative in project already exist",
                        "msg_er": "Название иницативы уже используется",
                    }
                )
            if initiative_update.project != project:
                raise serializers.ValidationError(
                    {
                        "project": f"initiative in project not exist",
                        "msg_er": "Такой инициативы у проекта не было создано",
                    }
                )

        return super().validate(attrs)


class InitiativesPropertiesFieldsTitleSettingsSerializer(
    serializers.ModelSerializer
):
    id = serializers.IntegerField()

    class Meta:
        model = PropertiesProject
        fields = [
            "id",
            "title",
            "initiative_activate",
        ]


class InitiativesPropertiesFieldsValueSettingsSerializer(
    serializers.ModelSerializer
):
    id = serializers.IntegerField()

    class Meta:
        model = PropertiesItemsProject
        fields = [
            "id",
            "value",
            "propertie",
        ]

    def validate(self, attrs):
        p_v = PropertiesItemsProject.get_property_item_by_id(attrs.get("id"))
        if not p_v:
            raise serializers.ValidationError(
                {
                    "id": "propertie item not exist",
                    "mas": "Згачения свойст с таким id не существует",
                }
            )
        return super().validate(attrs)


class MetricProjectSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()

    class Meta:
        model = MetricsProject
        fields = [
            "id",
            "title",
            "units",
            "initiative_activate",
        ]

    def validate_id(self, id):
        if not MetricsProject.get_metric_by_id(id):
            raise serializers.ValidationError(
                {
                    "id": "metrics not exist",
                    "msg": "Такой метрики не существует",
                }
            )

        return super().validate(id)


class InitiativesMetricsFieldsSerializer(serializers.ModelSerializer):
    metric = MetricProjectSerializer()

    class Meta:
        model = InitiativesMetricsFields
        fields = [
            "metric",
            "value",
        ]

    def validate_metric(self, metric):
        metric = MetricsProject.get_metric_by_id(metric.get("id"))
        if metric.project != self.context.get("project"):
            raise serializers.ValidationError(
                {
                    "id": "metric.project != real_project",
                    "msg": "Метрика проекта не совпадает с проектом инициативы",
                }
            )

        return super().validate(metric)


class InitiativesPropertiesFieldsSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()
    title = InitiativesPropertiesFieldsTitleSettingsSerializer()
    values = InitiativesPropertiesFieldsValueSettingsSerializer(many=True)

    class Meta:
        model = InitiativesPropertiesFields
        fields = ["id", "title", "values"]

    def validate(self, attrs):
        for value_item in attrs.get("values"):
            p_v = PropertiesItemsProject.get_property_item_by_id(
                value_item["id"]
            )
            if p_v.propertie.id != attrs["title"]["id"]:
                raise serializers.ValidationError(
                    {
                        "title-value": "no compbination",
                        "msg": "title.id == value.propertie",
                    }
                )
        return super().validate(attrs)

    def validate_id(self, id):
        p = PropertiesProject.get_property_by_id(id)
        if not p:
            raise serializers.ValidationError(
                {"id": "p not exist", "msg": "propertie not exist"}
            )
        if p.project != self.context.get("project"):
            raise serializers.ValidationError(
                {"id": "error id", "msg": "У этой емкости другой проект"}
            )
        return super().validate(id)


class RolesProjectSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()

    class Meta:
        model = RolesProject
        ref_name = "role in project"
        fields = [
            "id",
            "project",
            "name",
            "is_approve",
            "is_update",
        ]

    def validate_id(self, id):
        role = RolesProject.get_by_id(id)
        if not role:
            raise serializers.ValidationError({"id": "not exist"})
        init = self.context.get("init")
        if init.project != role.project:
            raise serializers.ValidationError({"id": "project not correct"})
        return id


class RolesUserInInitiativeSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    user = UserBaseSerializer()
    role = RolesProjectSerializer()

    class Meta:
        model = RolesUserInInitiative
        fields = [
            "id",
            "user",
            "role",
        ]

    def update_user_in_data(self, validated_data):
        user_info: dict = validated_data.get("user", {})
        user_email = user_info.get("email")
        user = User.objects.filter(email=user_email).first()
        validated_data["user"] = user

    def update_role_in_data(self, validated_data):
        role_info: dict = validated_data.get("role", {})
        role_id = role_info.get("id")
        role = RolesProject.objects.filter(id=role_id).first()
        validated_data["role"] = role

    def create(self, validated_data):
        self.update_user_in_data(validated_data)
        self.update_role_in_data(validated_data)
        init = validated_data["initiative"] = self.context.get("init")
        instance = (
            RolesUserInInitiative.objects.filter(initiative=init)
            .filter(user=validated_data.get("user"))
            .first()
        )
        if instance:
            instance.role = validated_data.get("role")
            instance.save()
        else:
            instance = RolesUserInInitiative.objects.create(**validated_data)
        self.context["items_not_delete"].append(instance.id)
        return instance

    @classmethod
    def check_delete_person(cls, context):
        init = context.get("init")
        items_not_delete = context.get("items_not_delete")
        RolesUserInInitiative.objects.filter(initiative=init).exclude(
            id__in=items_not_delete
        ).delete()


class CommunityUserInInitiativeSerializer(serializers.ModelSerializer):
    user = UserBaseSerializer()
    properties = ProperitsUserSerializer(many=True)

    class Meta:
        model = СommunityProject
        fields = ("user", "properties")


class StatusUserInInitiativeSerializer(serializers.Serializer):
    user_info = CommunityUserInInitiativeSerializer()
    status = serializers.BooleanField()


class CommunityRolesInInitiativeSerializer(serializers.Serializer):
    role = RolesProjectSerializer()
    community = StatusUserInInitiativeSerializer(many=True)


class InitiativeSerializer(serializers.Serializer):
    initiative = MainInitiativeSerializer()
    properties_fields = InitiativesPropertiesFieldsSerializer(many=True)
    metric_fields = InitiativesMetricsFieldsSerializer(many=True)
    addfields = AddFieldsInitiativeSerializer(many=True)
    roles = CommunityRolesInInitiativeSerializer(many=True, read_only=True)

    class Meta:
        fields = [
            "initiative",
            "properties_fields",
            "metric_fields",
        ]
        read_only_fields = ["roles"]

    def validate_addfields(self, addfields):
        project = self.context.get("project")
        if set(
            x.id
            for x in SettingsAddFeldsInitiative.get_by_settings_project(
                project.settings_initiatives.first()
            )
        ) != set(x["title"]["id"] for x in addfields):
            raise serializers.ValidationError(
                {
                    "addfields": f"error addfields",
                    "msg_er": "Не совпадает кол-во доп полей или название не те",
                }
            )

        return super().validate(addfields)

    def validate_properties_fields(self, properties_fields):
        project = self.context.get("project")
        if set(x.id for x in project.properties.all()) != set(
            x["title"]["id"] for x in properties_fields
        ):
            raise serializers.ValidationError(
                {
                    "addfields": f"error properties_fields",
                    "msg_er": "Не совпадает кол-во емкостей (свойств) полей либо id",
                    "desc": {
                        "properties in db ids": list(
                            set(x.id for x in project.properties.all())
                        )
                    },
                }
            )

        return super().validate(properties_fields)

    def validate_metric_fields(self, metric_fields):
        project = self.context.get("project")
        if set(x.id for x in project.metrics.all()) != set(
            x["metric"].id for x in metric_fields
        ):
            raise serializers.ValidationError(
                {
                    "addfields": f"error metric_fields",
                    "msg_er": "Не совпадает кол-во емкостей (свойств) полей либо id",
                    "desc": {
                        "metric_fields in db ids": list(
                            set(x.id for x in project.metrics.all())
                        )
                    },
                }
            )
        return super().validate(metric_fields)

    def validate(self, attrs):
        user = self.context.get("user")
        project = self.context.get("project")
        flags_rights = Project.get_user_rights_flag_in_project(user, project)
        if not flags_rights.get("is_create"):
            raise serializers.ValidationError(
                f"У пользователя {user.email} нет прав на создание инициативы"
            )
        return super().validate(attrs)

    def create_or_update(self, data):
        initiative = data.get("initiative")
        initiative_id = Initiatives.create_or_update(initiative)
        InitiativesPropertiesFields.create_or_update(
            initiative_id, data.get("properties_fields")
        )
        InitiativesAddFields.create(initiative_id, data.get("addfields"))
        InitiativesMetricsFields.create(
            initiative_id, data.get("metric_fields")
        )


class MainInfoInitiativeSerializer(serializers.ModelSerializer):
    class Meta:
        depth = 1
        model = SettingsComponents
        fields = [
            "id",
            "initiative_status",
            "initiative_addfields",
            "event_addfields",
            "risks_addfields",
        ]


class InfoSettingsInitiativeSerializer(serializers.Serializer):
    settings = MainInfoInitiativeSerializer()
    table_registry = TableRegistrySerializerInfo()


class SettingsInitiativeSerializer(serializers.ModelSerializer):
    """
    Настройка инициатив в проекте
    """

    addfields = AddFeldsInitiativesSerializer(many=True)
    events_addfields = AddFeldsEventsSerializer(many=True)
    risks_addfields = AddFeldsRisksSerializer(many=True)
    status = StatusInitiativeSerializer(many=True)
    table_registry = TableRegistrySerializer()

    class Meta:
        model = SettingsComponents
        fields = [
            "project",
            "addfields",
            "events_addfields",
            "risks_addfields",
            "status",
            "table_registry",
        ]

    def validate(self, attrs):
        super().validate(attrs)
        return attrs

    def validate_status(self, status):

        if not (list(x["value"] for x in status) == list(range(len(status)))):
            raise serializers.ValidationError(
                {
                    "status": "status list error",
                    "msg": "У одного статуса значение должно быть 0, дальше увеличиваться на 1 (по весу)",
                }
            )
        return super().validate(status)

    def create_or_update(self, valid_data):
        addfields = valid_data.get("addfields")
        events_addfields = valid_data.get("events_addfields")
        risks_addfields = valid_data.get("risks_addfields")
        status = valid_data.get("status")
        table_registry = valid_data.get("table_registry")

        project = valid_data.get("project")

        settings_components = SettingsComponents.get_settings_by_proejct(
            project
        )
        if not settings_components:
            settings_components = SettingsComponents.create(project)

        SettingsAddFeldsInitiative.create_or_update(
            settings_components.id, addfields
        )
        SettingsAddFeldsEvent.create_or_update(
            settings_components.id, events_addfields
        )
        SettingsAddFeldsRisks.create_or_update(
            settings_components.id, risks_addfields
        )

        SettingsStatusInitiative.create_or_update(
            settings_components.id, status
        )

        for propertie in table_registry.get("properties", []):
            propertie_obj = PropertiesProject.get_property_by_id(
                propertie.get("id")
            )
            propertie_obj.initiative_activate = propertie[
                "initiative_activate"
            ]
            propertie_obj.save()
        for metric in table_registry.get("metrics", []):
            metric_obj = MetricsProject.get_metric_by_id(metric["id"])
            metric_obj.initiative_activate = metric["initiative_activate"]
            metric_obj.save()


class ListInitiativeSerializer(serializers.Serializer):
    """
    Настройка инициатив в проекте
    """

    project_initiatives = InitiativeSerializer(many=True)

    def create_excel(self, user, data):
        def get_column_initiative(initiative, line, header):
            line += [
                initiative.get("id"),
                initiative.get("name"),
                initiative.get("status", {}).get("name"),
            ]
            header += [
                {"header": "№"},
                {"header": "Название инициативы"},
                {"header": "Статус"},
            ]

        def get_column_properties_fields(properties_fields, line, header):
            ans = []
            headers = []
            for properties_fields_item in properties_fields:
                title_obj = properties_fields_item.get("title")
                value_objs = properties_fields_item.get("values")
                if title_obj.get("initiative_activate"):
                    headers.append({"header": title_obj.get("title")})
                    ans_v = ""
                    for v in value_objs:
                        ans_v = ans_v + v.get("value") + ","
                    ans.append(ans_v)
            line += ans
            header += headers

        def get_column_metric_fields(metric_fields, line, header):
            ans = []
            headers = []
            for metric_fields_item in metric_fields:
                metric_obj = metric_fields_item.get("metric")
                value = metric_fields_item.get("value")
                if metric_obj.get("initiative_activate"):
                    headers.append({"header": metric_obj.get("title")})
                    ans.append(value)
            line += ans
            header += headers

        def get_column_addfields(addfields, line, header):
            ans = []
            headers = []
            for addfields_item in addfields:
                headers.append(
                    {"header": addfields_item.get("title").get("title")}
                )
                ans.append(addfields_item.get("value"))
            line += ans
            header += headers

        def get_column_roles(roles, line, header):
            ans = []
            headers = []
            for roles_item in roles:
                role = roles_item.get("role")
                community = roles_item.get("community")

                headers.append({"header": role.get("name")})
                user_in_roles = ""
                for community_item in community:
                    user_info = community_item.get("user_info")
                    user = user_info.get("user")
                    user_in_roles = (
                        user_in_roles
                        + f'{user.get("last_name")} {user.get("first_name")}.{user.get("second_name")}'
                        + "; "
                    )
                ans.append(user_in_roles)
            line += ans
            header += headers

        A_Z = [chr(x) for x in range(ord("A"), ord("Z") + 1)]

        file_path = f"media/files/user/{user.id}/"
        file_name = "reestr.xlsx"
        full_name_file_url = file_path + file_name
        if not os.path.exists(file_path):
            os.makedirs(file_path)

        workbook = xlsxwriter.Workbook(full_name_file_url)
        worksheet = workbook.add_worksheet()

        bold_center = workbook.add_format({"bold": True})
        bold_center.set_align("center")
        bold_center.set_align("vcenter")

        center = workbook.add_format()
        center.set_align("center")
        center.set_align("vcenter")

        table_data = []
        header = []
        line = []
        for i, line_table in enumerate(
            data.get("project_initiatives"), start=2
        ):
            line = []
            header = []
            get_column_initiative(line_table.get("initiative"), line, header)
            get_column_properties_fields(
                line_table.get("properties_fields"), line, header
            )
            get_column_metric_fields(
                line_table.get("metric_fields"), line, header
            )
            get_column_addfields(line_table.get("addfields"), line, header)
            get_column_roles(line_table.get("roles"), line, header)
            table_data.append(line.copy())
        last_symvol = A_Z[(len(header) - 1) % len(A_Z)]
        worksheet.add_table(
            f"A1:{last_symvol}{len(table_data) + 1}",
            {
                "data": table_data,
                "style": "Table Style Light 11",
                "columns": header,
            },
        )
        worksheet.set_column(0, len(line), 25, center)
        worksheet.set_column(0, 0, 5, center)
        worksheet.set_column(1, 1, 45, center)
        workbook.close()
        return full_name_file_url


class AddFieldRiskSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()

    class Meta:
        depth = 1
        model = RisksAddFields
        fields = [
            "id",
            "value",
            "title",
        ]


class MainRiskSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()

    class Meta:
        model = Risks
        fields = ["id", "name", "initiative", "author"]
        read_only_fields = ["author"]

    def validate(self, attrs):
        attrs["author"] = self.context.get("user")
        init = attrs.get("initiative")
        if not init:
            raise serializers.ValidationError(
                {"initiative": "initiative not exist"}
            )

        id = attrs.get("id")
        if id < 0:
            if Risks.cheack_name(init, attrs.get("name")):
                raise serializers.ValidationError(
                    {"name": "Имя уже используется"}
                )
        else:
            risk: Risks = Risks.get_by_id(attrs.get("id"))
            if not risk:
                raise serializers.ValidationError({"id": "id not exist"})

            if risk.initiative != init:
                raise serializers.ValidationError(
                    {"initiative or risk": "У инициативы нет таких рисков"}
                )
            new_name = attrs.get("name")
            risk_problem = (
                Risks.objects.filter(initiative=init)
                .filter(name=new_name)
                .first()
            )
            if risk_problem and risk_problem.id != id:
                raise serializers.ValidationError(
                    {"name": "Навание риска - уникально в рамках инициативы"}
                )
        return super().validate(attrs)


class RiskInfoSerializer(serializers.Serializer):
    risk = MainRiskSerializer()
    addfields = AddFieldRiskSerializer(many=True)

    def create_or_update(self, data):
        risk = data.get("risk")
        risk_id = Risks.create_or_update(risk)
        RisksAddFields.create(risk_id, data.get("addfields"))

    def validate_addfields(self, addfields):
        initiative = self.context.get("initiative")
        project = initiative.project
        valid_addfields_ids = set(
            str(x.id)
            for x in SettingsAddFeldsRisks.get_by_settings_project(
                project.settings_initiatives.first()
            )
        )
        now_addfields_ids = set(str(x["id"]) for x in addfields)
        if valid_addfields_ids != now_addfields_ids:
            raise serializers.ValidationError(
                {
                    "addfields": f"error addfields",
                    "msg_er": "Не совпадает кол-во доп полей или название не те",
                    "context": {
                        "ждали": ",".join(valid_addfields_ids),
                        "пришло": ",".join(now_addfields_ids),
                    },
                }
            )

        return super().validate(addfields)


class ListRiskSerializer(serializers.Serializer):

    initiative_risks = RiskInfoSerializer(many=True)


class MainEventSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()
    name = serializers.CharField()

    class Meta:
        model = Events
        fields = [
            "id",
            "initiative",
            "name",
            "date_start",
            "date_end",
            "ready",
        ]

    def validate(self, attrs):

        id = attrs.get("id", None)
        initiative = self.context.get("initiative")
        e_name = Events.get_by_name(initiative.id, attrs.get("name"))
        if id < 0 and e_name:
            raise serializers.ValidationError(
                {
                    "name": "name event exist",
                    "msg": "Имя мероприятия уже используется у этой инициативы",
                }
            )
        if id > 0:
            e_id = Events.get_by_id(id)
            if not e_id:
                raise serializers.ValidationError(
                    {
                        "id": "id event not exist",
                        "msg": "Такого мероприятия нет для обновления",
                    }
                )
            if e_name and e_name.id != id:
                raise serializers.ValidationError(
                    {
                        "name": "name event exist",
                        "msg": "Новое имя мероприятия уже используется",
                    }
                )

        return super().validate(attrs)

    def validate_initiative(self, initiative):
        user = self.context.get("user")
        if not (initiative.project in Project.get_user_projects(user)):
            raise serializers.ValidationError(
                {"initiative": "Пользователь не связан с этой инициативой"}
            )


class AddFieldEventSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()

    class Meta:
        depth = 1
        model = EventsAddFields
        fields = [
            "id",
            "title",
            "value",
        ]


class EventMetricsFieldsSerializer(serializers.ModelSerializer):
    metric = MetricProjectSerializer()

    class Meta:
        # depth = 1
        model = EventMetricsFields
        fields = [
            "metric",
            "value",
        ]


class EventSerializer(serializers.Serializer):
    event = MainEventSerializer()
    event_status = serializers.CharField(required=False)
    metric_fields = EventMetricsFieldsSerializer(many=True)
    addfields = AddFieldEventSerializer(many=True)

    def validate(self, attrs):
        return super().validate(attrs)

    def validate_metric_fields(self, metric_fields):
        initiative = self.context.get("initiative")
        project: Project = initiative.project
        if set(m.id for m in project.metrics.all()) != set(
            e["metric"]["id"] for e in metric_fields
        ):
            raise serializers.ValidationError(
                {
                    "metric_fields": "metric_fields error",
                    "msg": "Метрики в базе не совпадают с переданными",
                    "desc": {
                        "metric_fields in db": ", ".join(
                            list(str(m.id) for m in project.metrics.all())
                        )
                    },
                }
            )
        return super().validate(metric_fields)

    def validate_addfields(self, addfields):
        initiative = self.context.get("initiative")
        project = initiative.project
        correct_value = set(
            str(x.id)
            for x in SettingsAddFeldsEvent.get_by_settings_project(
                project.settings_initiatives.first()
            )
        )
        data_value = set(str(x["id"]) for x in addfields)

        if correct_value != data_value:
            raise serializers.ValidationError(
                {
                    "addfields": f"error addfields",
                    "msg_er": "Не совпадает кол-во доп полей или название не те",
                    "context": {
                        "ждали": ",".join(list(correct_value)),
                        "пришло": ",".join(list(data_value)),
                    },
                }
            )

        return super().validate(addfields)

    def create_or_update(self, data):
        initiative: Initiatives = self.context.get("initiative")
        event = data.get("event")
        event_id = Events.create_or_update(event)
        EventsAddFields.create(event_id, data.get("addfields"))
        metrics_delta = EventMetricsFields.create_or_update(
            event_id, data.get("metric_fields")
        )
        for metric_project_id, delta in metrics_delta.items():
            InitiativesMetricsFields.add_delta_value(
                initiative, metric_project_id, delta
            )


class ListEventSerializer(serializers.Serializer):

    initiative_events = EventSerializer(many=True)


class MetricItemUserStat(serializers.Serializer):
    title = serializers.CharField()
    value = serializers.FloatField()


class UserPersonStatisticSerializer(serializers.Serializer):
    """
    Настройка инициатив в проекте
    """

    user_initiatives = InitiativeSerializer(many=True)
    events = MainEventSerializer(many=True)
    metrics_user_stat = MetricItemUserStat(many=True)


class DeleteRiskSerializer(serializers.Serializer):
    id = serializers.IntegerField()

    def validate_id(self, id):
        user = self.context.get("user")
        risc_obj = get_object_or_404(Risks, id=id)
        if user.is_staff or risc_obj.author == user:
            return id

        serializers.ValidationError({"id": "not enough rights"})


class SettingsFilesInitiativeSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()

    class Meta:
        model = SettingsFilesInitiative
        fields = [
            "id",
            "settings_project",
            "title",
            "status",
        ]
        read_only_fields = ["settings_project"]

    def create(self, validated_data):
        id = validated_data.pop("id")
        validated_data["settings_project"] = self.context.get(
            "settings_project"
        )
        if id < 0:
            return SettingsFilesInitiative.objects.create(**validated_data)
        instance = SettingsFilesInitiative.objects.filter(id=id).first()
        return self.update(instance, validated_data)


class SettingsFilesInitiativeReadSerializer(serializers.Serializer):
    status = StatusInitiativeSerializer()
    settings_file = SettingsFilesInitiativeSerializer(many=True)


class InitiativesFilesSerializer(serializers.ModelSerializer):
    class Meta:
        model = InitiativesFiles
        fields = "__all__"

class InfoInitiativesFilesSerializer(serializers.Serializer):
    title = SettingsFilesInitiativeSerializer()
    file = InitiativesFilesSerializer()
