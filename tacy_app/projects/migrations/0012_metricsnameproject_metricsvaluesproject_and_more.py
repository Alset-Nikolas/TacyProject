# Generated by Django 4.1.2 on 2022-10-14 10:17

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0011_project_number'),
    ]

    operations = [
        migrations.CreateModel(
            name='MetricsNameProject',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(help_text='Введите название метрики', max_length=30, verbose_name='Метрика проекта')),
                ('project', models.ForeignKey(blank=True, help_text='Проект к которому относятся метрики', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='metrics_name', to='projects.project', verbose_name='Проект')),
            ],
            options={
                'db_table': 'metrics_names_tb',
            },
        ),
        migrations.CreateModel(
            name='MetricsValuesProject',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('values', models.FloatField()),
                ('project', models.ForeignKey(blank=True, help_text='Проект к которому относятся метрики', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='metrics', to='projects.project', verbose_name='Проект')),
                ('title', models.ForeignKey(blank=True, help_text='Введите название метрики ', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='value', to='projects.metricsnameproject', verbose_name='Название метрики')),
            ],
            options={
                'db_table': 'metrics_values_tb',
            },
        ),
        migrations.DeleteModel(
            name='MetricsProject',
        ),
    ]
