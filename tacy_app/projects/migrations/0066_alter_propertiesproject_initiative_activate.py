# Generated by Django 4.1.2 on 2022-11-11 11:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0065_alter_metricsproject_initiative_activate'),
    ]

    operations = [
        migrations.AlterField(
            model_name='propertiesproject',
            name='initiative_activate',
            field=models.BooleanField(default=True),
        ),
    ]
