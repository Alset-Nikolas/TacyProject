# Generated by Django 4.1.5 on 2023-02-09 13:11

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('components', '0007_alter_initiatives_status_and_more'),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name='events',
            name='unique event initiative name',
        ),
    ]