# Generated by Django 4.1.2 on 2022-11-17 17:10

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('grafics', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='graficsproject',
            old_name='propertie',
            new_name='properties',
        ),
    ]
