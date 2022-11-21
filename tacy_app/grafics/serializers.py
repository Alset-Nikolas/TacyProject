from rest_framework import serializers
from .models import GraficsProject
from projects.models import PropertiesProject


class GraficsProjectSerializerItem(serializers.ModelSerializer):
    class Meta:
        # depth = 1
        model = GraficsProject
        fields = (
            "propertie",
            "metrics",
        )

    def validate_metrics(self, metrics):
        project = self.context.get("project")
        if any(metric.project != project for metric in metrics):
            raise serializers.ValidationError(
                {
                    "metric": f"Not exist metric pk in project",
                    "msg_er": "В этом проекте таких метрик нет",
                }
            )
        return metrics

    def validate_propertie(self, propertie):

        project = self.context.get("project")
        if propertie.project != project:
            raise serializers.ValidationError(
                {
                    "propertie": f"Not exist propertie pk in project",
                    "msg_er": "В этом проекте таких емкостей (свойств) нет",
                }
            )
        return propertie

    def validate(self, attrs):
        return super().validate(attrs)


class GraficsProjectInfoSerializerItem(GraficsProjectSerializerItem):
    class Meta:
        depth = 1
        model = GraficsProject
        fields = (
            "propertie",
            "metrics",
        )


class GraficsProjectSerializer(serializers.Serializer):
    grafics = GraficsProjectSerializerItem(many=True)


class GraficsProjectInfoSerializer(serializers.Serializer):
    grafics = GraficsProjectInfoSerializerItem(many=True)


class PropertieSerializer(serializers.Serializer):
    propertie = serializers.IntegerField()

    def validate_id(self, attrs_id):
        propertie = PropertiesProject.get_property_by_id(attrs_id)
        if not propertie:
            return serializers.ValidationError({"not exist"})
        if propertie.project != self.context.get("project"):
            raise serializers.ValidationError("Это емкость у другого проекта")
        return super().validate(attrs_id)
