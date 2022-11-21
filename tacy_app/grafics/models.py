from django.db import models
from projects.models import Project, PropertiesProject, MetricsProject
from components.models import (
    Initiatives,
    MetricsProject,
    PropertiesProject,
    PropertiesItemsProject,
    SettingsStatusInitiative,
)
import copy

# Create your models here.


class GraficsProject(models.Model):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="grafics",
        help_text="Проект к которому относятся графики",
        verbose_name="Проект",
    )
    propertie = models.ForeignKey(PropertiesProject, on_delete=models.CASCADE)
    metrics = models.ManyToManyField(MetricsProject)

    class Meta:
        db_table = "grafics_project"

    @classmethod
    def create_or_update_grafics_in_project(cls, project, grafics: list):
        cls.objects.filter(project=project).delete()
        for graf in grafics:
            propertie = graf.get("propertie")
            graf_obj = cls.objects.create(
                project=project, propertie_id=propertie
            )
            for m in graf.get("metrics"):
                graf_obj.metrics.add(m)
            graf_obj.save()

    @classmethod
    def get_by_project(cls, project):
        return cls.objects.filter(project=project).all()

    @classmethod
    def generate_start_statistic(cls, project):
        res = {}
        for p_project in PropertiesProject.objects.filter(
            project=project
        ).all():
            p_id = p_project.id
            if p_id not in res:
                res[p_id] = dict()
            for m_project in MetricsProject.objects.filter(
                project=project
            ).all():
                m_id = m_project.id
                if m_id not in res[p_id]:
                    res[p_id][m_id] = {}
                grafic_info = res[p_id][m_id]
                for p_value_obj in p_project.items.all():
                    p_item_value_name = p_value_obj.value
                    if p_item_value_name not in grafic_info:
                        grafic_info[p_item_value_name] = 0
                grafic_info = res[p_id]["enum"] = dict()
                for p_value_obj in p_project.items.all():
                    p_item_value_name = p_value_obj.value
                    if p_item_value_name not in grafic_info:
                        grafic_info[p_item_value_name] = 0
        return res

    @classmethod
    def generate_start_statistic_status(cls, project):
        res = {}
        for (
            status
        ) in project.settings_initiatives.first().initiative_status.all():
            for m_project in MetricsProject.objects.filter(
                project=project
            ).all():
                m_id = m_project.id
                if m_id not in res:
                    res[m_id] = dict()
                item = res[m_id]
                if status.name not in item:
                    item[status.name] = 0
        res["enum"] = dict()
        for (
            status
        ) in project.settings_initiatives.first().initiative_status.all():
            if status.name not in res["enum"]:
                res["enum"][status.name] = 0

        return res

    @classmethod
    def update_format(cls, res):
        grafics = res["grafics"]
        status_grafic = res["status_grafic"]
        new_format_res = copy.copy(grafics)
        new_format_status_grafic = copy.copy(status_grafic)
        if grafics:
            # если есть обьемы
            for v_id, m_dict in grafics.items():
                for m_id, grafic_item in m_dict.items():
                    new_format = []
                    for x_name, y_value in grafic_item.items():
                        new_format.append({"name": x_name, "value": y_value})
                    new_format_res[v_id][m_id] = new_format
        for m_id, grafic_item in new_format_status_grafic.items():
            new_format = []
            for x_name, y_value in grafic_item.items():
                new_format.append({"name": x_name, "value": y_value})
            new_format_status_grafic[m_id] = new_format
        return {
            "grafics": new_format_res,
            "status_grafic": new_format_status_grafic,
        }

    @classmethod
    def get_statistic_metrics_by_project(cls, project):
        res = GraficsProject.generate_start_statistic(project)
        res_status = GraficsProject.generate_start_statistic_status(project)
        for init in Initiatives.objects.filter(project=project).all():
            status_name = init.status.name
            res_status["enum"][status_name] += 1
            for init_propertie_field in init.properties_fields.all():
                propertie_title_id = init_propertie_field.title.id
                if init_propertie_field.value:
                    propertie_value_name = init_propertie_field.value.value
                    grafic_enum = res[propertie_title_id]["enum"]
                    grafic_enum[propertie_value_name] += 1
                    for init_metric_field in init.metric_fields.all():
                        metric_id = init_metric_field.metric.id
                        metric_value = init_metric_field.value
                        grafic_info = res[propertie_title_id][metric_id]
                        if not init.failure:
                            grafic_info[propertie_value_name] += metric_value

            for init_metric_field in init.metric_fields.all():
                metric_id = init_metric_field.metric.id
                metric_value = init_metric_field.value
                res_status[metric_id][status_name] += metric_value
        res = {"grafics": res, "status_grafic": res_status}
        return GraficsProject.update_format(res)

    @classmethod
    def get_statistic_by_project(cls, project):
        for m_obj in project.metrics.all():
            print(m_obj.title, m_obj.value)
