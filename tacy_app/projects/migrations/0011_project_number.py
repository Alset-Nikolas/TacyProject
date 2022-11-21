# Generated by Django 4.1.2 on 2022-10-14 08:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0010_remove_сommunityproject_param_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='number',
            field=models.IntegerField(default=1, help_text='Введите уникальный номер проекта', unique=True, verbose_name='Уникальный номер проекта'),
            preserve_default=False,
        ),
    ]
