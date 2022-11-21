# Generated by Django 4.1.2 on 2022-10-15 19:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0025_alter_project_community_alter_сommunityproject_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='description',
            field=models.TextField(default='Мои цели на этот проект', verbose_name='Описание проекта'),
        ),
        migrations.AddField(
            model_name='project',
            name='purpose',
            field=models.TextField(default='Мои цели на этот проект', verbose_name='Цель проекта'),
        ),
        migrations.AddField(
            model_name='project',
            name='tasks',
            field=models.TextField(default='Мои задачи на этот проект', verbose_name='Задачи проекта'),
        ),
    ]
