# Generated by Django 4.1.2 on 2022-11-27 21:22

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('components', '0001_initial'),
        ('projects', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='settingscomponents',
            name='project',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='settings_initiatives', to='projects.project'),
        ),
        migrations.AddField(
            model_name='settingsaddfeldsrisks',
            name='settings_project',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='risks_addfields', to='components.settingscomponents'),
        ),
        migrations.AddField(
            model_name='settingsaddfeldsinitiative',
            name='settings_project',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='initiative_addfields', to='components.settingscomponents'),
        ),
        migrations.AddField(
            model_name='settingsaddfeldsevent',
            name='settings_project',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='event_addfields', to='components.settingscomponents'),
        ),
        migrations.AddField(
            model_name='risksaddfields',
            name='risk',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='addfields', to='components.risks'),
        ),
        migrations.AddField(
            model_name='risksaddfields',
            name='title',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='components.settingsaddfeldsrisks'),
        ),
        migrations.AddField(
            model_name='risks',
            name='initiative',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='risks', to='components.initiatives'),
        ),
        migrations.AddField(
            model_name='initiativespropertiesfields',
            name='initiative',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='properties_fields', to='components.initiatives'),
        ),
        migrations.AddField(
            model_name='initiativespropertiesfields',
            name='title',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='projects.propertiesproject'),
        ),
        migrations.AddField(
            model_name='initiativespropertiesfields',
            name='value',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='projects.propertiesitemsproject'),
        ),
        migrations.AddField(
            model_name='initiativesmetricsfields',
            name='initiative',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='metric_fields', to='components.initiatives'),
        ),
        migrations.AddField(
            model_name='initiativesmetricsfields',
            name='metric',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='projects.metricsproject'),
        ),
        migrations.AddField(
            model_name='initiativesaddfields',
            name='initiative',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='addfields', to='components.initiatives'),
        ),
        migrations.AddField(
            model_name='initiativesaddfields',
            name='title',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='components.settingsaddfeldsinitiative'),
        ),
    ]
