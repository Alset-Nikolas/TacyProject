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
)
from projects.models import PropertiesProject, MetricsProject, Project

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
        print("PropertiesProjectActiveSerializer", property_, id)
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
        print("PropertiesProjectActiveSerializer", property_, id)
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
        print("validate_id", id)
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
    value = InitiativesPropertiesFieldsValueSettingsSerializer()

    class Meta:
        model = InitiativesPropertiesFields
        fields = ["id", "title", "value"]

    def validate(self, attrs):

        p_v = PropertiesItemsProject.get_property_item_by_id(
            attrs["value"]["id"]
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


class InitiativeSerializer(serializers.Serializer):
    initiative = MainInitiativeSerializer()
    properties_fields = InitiativesPropertiesFieldsSerializer(many=True)
    metric_fields = InitiativesMetricsFieldsSerializer(many=True)
    addfields = AddFieldsInitiativeSerializer(many=True)

    class Meta:
        fields = [
            "initiative",
            "properties_fields",
            "metric_fields",
        ]

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
        fields = ["id", "name", "initiative"]

    def validate(self, attrs):
        init = attrs.get("initiative")
        print("init", init)
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
        print("initiative", initiative)
        project = initiative.project
        if set(
            x.id
            for x in SettingsAddFeldsRisks.get_by_settings_project(
                project.settings_initiatives.first()
            )
        ) != set(x["id"] for x in addfields):
            raise serializers.ValidationError(
                {
                    "addfields": f"error addfields",
                    "msg_er": "Не совпадает кол-во доп полей или название не те",
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

    def validate(self, attrs):
        id = attrs.get("id")
        e = SettingsAddFeldsEvent.get_by_id(id)
        if not e:
            raise serializers.ValidationError(
                {
                    "id": "not exist",
                    "msg": "Таких доп полей нет у мероприятий",
                }
            )

        return super().validate(attrs)


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
    addfields = AddFieldEventSerializer(many=True)
    metric_fields = EventMetricsFieldsSerializer(many=True)

    def validate(self, attrs):
        print("EventSerializer", attrs)

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
