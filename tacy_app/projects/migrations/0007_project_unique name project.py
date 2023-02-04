# Generated by Django 4.1.5 on 2023-02-04 18:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0006_remove_project_unique name project'),
    ]

    operations = [
        migrations.AddConstraint(
            model_name='project',
            constraint=models.UniqueConstraint(fields=('id', 'name'), name='unique name project'),
        ),
    ]
