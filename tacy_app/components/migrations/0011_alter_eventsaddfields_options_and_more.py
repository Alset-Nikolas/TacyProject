# Generated by Django 4.1.5 on 2023-04-22 10:54

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('components', '0010_alter_initiatives_current_state_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='eventsaddfields',
            options={'ordering': ['pk']},
        ),
        migrations.AlterModelOptions(
            name='initiativesaddfields',
            options={'ordering': ['pk']},
        ),
        migrations.AlterModelOptions(
            name='initiativesmetricsfields',
            options={'ordering': ['pk']},
        ),
        migrations.AlterModelOptions(
            name='risksaddfields',
            options={'ordering': ['pk']},
        ),
        migrations.AlterModelOptions(
            name='settingsaddfeldsinitiative',
            options={'ordering': ['pk']},
        ),
    ]
