# Generated by Django 4.1.5 on 2023-01-28 10:16

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('components', '0001_initial'),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name='initiatives',
            name='unique name initiatives',
        ),
    ]