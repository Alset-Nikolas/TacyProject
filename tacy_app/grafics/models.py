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
    metric = models.ForeignKey(MetricsProject, on_delete=models.CASCADE)
    activate = models.BooleanField(default=False)

    class Meta:
        db_table = "grafics_project"

    @classmethod
    def create_or_update_grafics_in_project(cls, project, grafics: list):
        for graf in grafics:

            propertie_id = graf["propertie"]["id"]
            for m_obj in graf.get("metrics"):
                metric_id = m_obj["metric"]["id"]

                graf_obj = (
                    cls.objects.filter(project=project)
                    .filter(propertie_id=propertie_id)
                    .filter(metric_id=metric_id)
                    .first()
                )
                if not graf_obj:
                    graf_obj = cls.objects.create(
                        project=project,
                        propertie_id=propertie_id,
                        metric_id=metric_id,
                        activate=graf.get("activate", False),
                    )
                graf_obj.activate = m_obj.get("activate", False)
                graf_obj.save()

    @classmethod
    def get_by_project(cls, project):
        prop_list = PropertiesProject.objects.filter(project=project).all()
        metrics_list = MetricsProject.objects.filter(project=project).all()
        res = []
        for p in prop_list:
            item = {}
            item["propertie"] = p
            item["metrics"] = []
            for m in metrics_list:
                graf_obj = (
                    cls.objects.filter(project=project)
                    .filter(propertie=p)
                    .filter(metric=m)
                    .first()
                )
                if not graf_obj:
                    graf_obj = cls.objects.create(
                        project=project, propertie=p, metric=m
                    )
                item["metrics"].append(graf_obj)
            res.append(item)
        return res

    @classmethod
    def generate_start_statistic(cls, project):
        res = {}
        for p_project in PropertiesProject.objects.filter(
            project=project
        ).all():
            p_id = p_project.id
            if p_id not in res:
                res[p_id] = dict()
                res[p_id]["enum"] = dict()

            for p_value_obj in p_project.items.all():
                for m_project in MetricsProject.objects.filter(
                    project=project
                ).all():
                    m_id = m_project.id
                    if m_id not in res[p_id]:
                        res[p_id][m_id] = {}
                    grafic_info = res[p_id][m_id]
                    if p_value_obj not in grafic_info:
                        grafic_info[p_value_obj] = 0
                grafic_info_enum = res[p_id]["enum"]
                if p_value_obj not in grafic_info_enum:
                    grafic_info_enum[p_value_obj] = 0
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
                if status not in item:
                    item[status] = 0
        res["enum"] = dict()
        for (
            status
        ) in project.settings_initiatives.first().initiative_status.all():
            if status not in res["enum"]:
                res["enum"][status] = 0
        return res

    @classmethod
    def update_format(cls, res, project, quantity=None):
        def group_small_values(info, quantity):
            if not quantity or len(new_format) - 1 <= quantity:
                return info
            group_small_item = {
                "name": "Другие",
                "name_short": "Другие",
                "value": 0,
            }
            quantity = int(quantity)
            group_small_item["value"] = sum(
                x.get("value") for x in new_format[quantity:-1]
            )
            return (
                new_format[:quantity] + [group_small_item] + [new_format[-1]]
            )

        grafics = res["grafics"]
        status_grafic = res["status_grafic"]
        new_format_res = copy.deepcopy(grafics)
        new_format_status_grafic = copy.deepcopy(status_grafic)
        m_id_not_in_stat = set()
        if grafics:
            for v_id, m_dict in grafics.items():
                for m_id, grafic_item in m_dict.items():
                    if m_id != "enum" and (
                        cls.objects.filter(project=project)
                        .filter(activate=False)
                        .filter(propertie_id=v_id)
                        .filter(metric_id=m_id)
                        .exists()
                    ):
                        new_format_res[v_id].pop(m_id)
                        m_id_not_in_stat.add(m_id)
                    else:
                        new_format = []
                        total_sum_value = 0
                        for x_name, y_value in grafic_item.items():
                            new_format.append(
                                {
                                    "name": x_name.value,
                                    "name_short": x_name.value_short,
                                    "value": y_value,
                                }
                            )
                            total_sum_value += y_value
                        new_format.sort(
                            key=lambda x: x.get("value"), reverse=True
                        )
                        new_format.append(
                            {
                                "name": "Сумма",
                                "name_short": "Сумма",
                                "value": total_sum_value,
                            }
                        )
                        new_format_res[v_id][m_id] = group_small_values(
                            new_format, quantity
                        )

        for m_id, grafic_item in status_grafic.items():
            if m_id not in m_id_not_in_stat:  # только активные графики
                new_format = []
                total_sum_value = 0
                for x_name, y_value in grafic_item.items():
                    new_format.append(
                        {
                            "name": x_name.name,
                            "name_short": x_name.name,
                            "value": y_value,
                        }
                    )
                    total_sum_value += y_value
                new_format.sort(key=lambda x: x.get("value"), reverse=True)
                new_format.append(
                    {
                        "name": "Сумма",
                        "name_short": "Сумма",
                        "value": total_sum_value,
                    }
                )
                new_format_status_grafic[m_id] = group_small_values(
                    new_format, quantity
                )
            else:
                new_format_status_grafic.pop(m_id)
        print(new_format_res)

        return {
            "grafics": new_format_res,
            "status_grafic": new_format_status_grafic,
        }

    @classmethod
    def get_statistic_metrics_by_project(
        cls, project, inits=None, quantity=None
    ):
        inits = inits or Initiatives.objects.filter(project=project).all()
        res = GraficsProject.generate_start_statistic(project)
        res_status = GraficsProject.generate_start_statistic_status(project)
        for init in inits:
            status_name = init.status
            res_status["enum"][status_name] += 1
            for init_propertie_field in init.properties_fields.all():
                propertie_title_id = init_propertie_field.title.id
                for propertie_value_name in init_propertie_field.values.all():
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
        return GraficsProject.update_format(res, project, quantity)

    @classmethod
    def get_statistic_user(cls, user, project, quantity=None):
        return GraficsProject.get_statistic_metrics_by_project(
            project=project,
            inits=Initiatives.get_user_initiatievs(user, project),
            quantity=quantity,
        )

    @classmethod
    def get_statistic_by_project(cls, project):
        for m_obj in project.metrics.all():
            print(m_obj.title, m_obj.value)
