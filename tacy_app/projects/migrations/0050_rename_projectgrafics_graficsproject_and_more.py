# Generated by Django 4.1.2 on 2022-10-26 17:11

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0049_projectgrafics'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='ProjectGrafics',
            new_name='GraficsProject',
        ),
        migrations.AlterModelTable(
            name='graficsproject',
            table='grafics_project',
        ),
    ]
