# Generated by Django 4.1.5 on 2023-01-13 20:53

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('components', '0003_initial'),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name='initiativespropertiesfields',
            name='unique field properties title',
        ),
    ]
