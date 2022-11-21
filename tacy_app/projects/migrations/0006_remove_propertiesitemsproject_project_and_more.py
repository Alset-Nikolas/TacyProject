# Generated by Django 4.1.2 on 2022-10-13 10:23

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0005_rename_values_propertiesitemsproject_value_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='propertiesitemsproject',
            name='project',
        ),
        migrations.AddField(
            model_name='propertiesitemsproject',
            name='propertie',
            field=models.ForeignKey(blank=True, help_text='Введите название свойтсва', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='properties_items', to='projects.propertiesproject', verbose_name='Значение свойства'),
        ),
        migrations.AlterField(
            model_name='intermediatedateproject',
            name='date',
            field=models.DateField(help_text='Введите промежуточную дату проекта', verbose_name='Промежуточная дата'),
        ),
        migrations.AlterField(
            model_name='metricsproject',
            name='title',
            field=models.CharField(help_text='Введите название метрики', max_length=30, verbose_name='Метрика проекта'),
        ),
        migrations.AlterField(
            model_name='project',
            name='date_end',
            field=models.DateField(help_text='Введите дату окончания проекта', verbose_name='Дата окончания'),
        ),
        migrations.AlterField(
            model_name='project',
            name='date_start',
            field=models.DateField(help_text='Введите дату начала проекта', verbose_name='Дата начала'),
        ),
        migrations.AlterField(
            model_name='propertiesitemsproject',
            name='value',
            field=models.CharField(help_text='Введите возможное значение свойства', max_length=30, verbose_name='Значение свойства'),
        ),
    ]
