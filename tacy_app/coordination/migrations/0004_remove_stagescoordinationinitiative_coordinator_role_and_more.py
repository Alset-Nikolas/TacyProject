# Generated by Django 4.1.5 on 2023-02-10 20:42

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('components', '0008_remove_events_unique event initiative name'),
        ('coordination', '0003_stagescoordinationinitiative_coordinator_role'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='stagescoordinationinitiative',
            name='coordinator_role',
        ),
        migrations.AlterField(
            model_name='stagescoordinationinitiative',
            name='coordinator_stage',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='components.rolesuserininitiative'),
        ),
    ]