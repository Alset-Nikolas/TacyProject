# Generated by Django 4.1.2 on 2022-11-18 19:37

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0069_delete_graficsproject'),
        ('grafics', '0003_remove_graficsproject_metric_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='graficsproject',
            name='metric',
        ),
        migrations.RemoveField(
            model_name='graficsproject',
            name='properties',
        ),
        migrations.AddField(
            model_name='graficsproject',
            name='metrics',
            field=models.ManyToManyField(to='projects.metricsproject'),
        ),
        migrations.AddField(
            model_name='graficsproject',
            name='propertie',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='projects.propertiesproject'),
            preserve_default=False,
        ),
    ]
