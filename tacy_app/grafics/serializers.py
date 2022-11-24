from rest_framework import serializers
from .models import GraficsProject
from projects.models import PropertiesProject, MetricsProject


class MetricsSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()

    class Meta:
        model = MetricsProject
        fields = ("id", "title")

    def validate_id(self, id):

        project = self.context.get("project")
        metric = MetricsProject.get_metric_by_id(id)
        if not metric:
            raise serializers.ValidationError(
                {
                    "metric": f"Not exist metric",
                    "msg_er": "В этом проекте таких емкостей (свойств) нет",
                }
            )
        if metric.project != project:
            raise serializers.ValidationError(
                {
                    "metric": f"Not exist metric pk in project",
                    "msg_er": "В этом проекте таких емкостей (свойств) нет",
                }
            )
        return id


class GraficsProjectInfoSerializerItem(serializers.ModelSerializer):
    metric = MetricsSerializer()

    class Meta:
        depth = 1
        model = GraficsProject
        fields = (
            "metric",
            "activate",
        )


class PropertieSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()

    class Meta:
        model = PropertiesProject
        fields = ("id", "title")

    def validate_id(self, id):

        project = self.context.get("project")
        p = PropertiesProject.get_property_by_id(id)
        if not p:
            raise serializers.ValidationError(
                {
                    "propertie": f"Not exist",
                    "msg_er": "В этом проекте таких емкостей (свойств) нет",
                }
            )
        if p.project != project:
            raise serializers.ValidationError(
                {
                    "propertie": f"Not exist propertie pk in project",
                    "msg_er": "В этом проекте таких емкостей (свойств) нет",
                }
            )
        return id


class GraficsProjectInfoSerializerBigItem(serializers.Serializer):
    propertie = PropertieSerializer()
    metrics = GraficsProjectInfoSerializerItem(many=True)


class GraficsProjectSerializer(serializers.Serializer):
    grafics = GraficsProjectInfoSerializerBigItem(many=True)
