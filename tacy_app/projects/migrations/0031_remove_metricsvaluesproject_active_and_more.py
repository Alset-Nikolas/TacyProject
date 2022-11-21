# Generated by Django 4.1.2 on 2022-10-16 20:22

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0030_alter_metricsvaluesproject_title'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='metricsvaluesproject',
            name='active',
        ),
        migrations.RemoveField(
            model_name='metricsvaluesproject',
            name='project',
        ),
        migrations.RemoveField(
            model_name='metricsvaluesproject',
            name='title',
        ),
        migrations.AddField(
            model_name='metricsnameproject',
            name='active',
            field=models.BooleanField(default=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='metricsvaluesproject',
            name='metric',
            field=models.ForeignKey(blank=True, help_text='Введите название метрики', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='metric_value', to='projects.metricsnameproject', verbose_name='Значение метрики'),
        ),
    ]
