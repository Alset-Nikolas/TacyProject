# Generated by Django 4.1.2 on 2022-11-27 12:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0070_rightsuserbool_is_watch'),
    ]

    operations = [
        migrations.AlterField(
            model_name='project',
            name='name',
            field=models.CharField(help_text='Введите название проекта', max_length=150, verbose_name='Название проекта'),
        ),
    ]
