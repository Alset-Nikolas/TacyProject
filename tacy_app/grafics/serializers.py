from rest_framework import serializers
from .models import GraficsProject
from projects.models import PropertiesProject, MetricsProject


class GraficsProjectSerializerItem(serializers.ModelSerializer):
    class Meta:
        # depth = 1
        model = GraficsProject
        fields = (
            "propertie",
            "metric",
            "activate",
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


class PropertieSerializer(serializers.ModelSerializer):
    class Meta:
        model = MetricsProject
        fields = ("id", "title")


class GraficsProjectInfoSerializerItem(serializers.ModelSerializer):
    metric = PropertieSerializer()

    class Meta:
        depth = 1
        model = GraficsProject
        fields = (
            "metric",
            "activate",
        )


class PropertieSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertiesProject
        fields = ("id", "title")


class GraficsProjectInfoSerializerBigItem(serializers.Serializer):
    propertie = PropertieSerializer()
    metrics = GraficsProjectInfoSerializerItem(many=True)


class GraficsProjectSerializer(serializers.Serializer):
    grafics = GraficsProjectInfoSerializerBigItem(many=True)
