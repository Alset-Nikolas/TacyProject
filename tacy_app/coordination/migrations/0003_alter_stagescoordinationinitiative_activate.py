# Generated by Django 4.1.5 on 2023-01-13 20:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('coordination', '0002_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='stagescoordinationinitiative',
            name='activate',
            field=models.BooleanField(default=False),
        ),
    ]
