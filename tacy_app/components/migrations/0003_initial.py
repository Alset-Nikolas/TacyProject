# Generated by Django 4.1.2 on 2022-11-27 21:22

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('components', '0002_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('projects', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='initiatives',
            name='author',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='creator_initiatives', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='initiatives',
            name='project',
            field=models.ForeignKey(blank=True, help_text='Проект к которому относятся инициативы', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='initiatives', to='projects.project', verbose_name='Проект'),
        ),
        migrations.AddField(
            model_name='initiatives',
            name='status',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='initiatives', to='components.settingsstatusinitiative'),
        ),
        migrations.AddField(
            model_name='eventsaddfields',
            name='event',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='addfields', to='components.events'),
        ),
        migrations.AddField(
            model_name='eventsaddfields',
            name='title',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='components.settingsaddfeldsevent'),
        ),
        migrations.AddField(
            model_name='events',
            name='author',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='creator_events', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='events',
            name='initiative',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='events', to='components.initiatives'),
        ),
        migrations.AddField(
            model_name='eventmetricsfields',
            name='event',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='metric_fields', to='components.events'),
        ),
        migrations.AddField(
            model_name='eventmetricsfields',
            name='metric',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='projects.metricsproject'),
        ),
        migrations.AddConstraint(
            model_name='settingsstatusinitiative',
            constraint=models.UniqueConstraint(fields=('settings_project', 'name'), name='unique status name initiatives'),
        ),
        migrations.AddConstraint(
            model_name='risksaddfields',
            constraint=models.UniqueConstraint(fields=('risk', 'title'), name='unique field risk title'),
        ),
        migrations.AddConstraint(
            model_name='risks',
            constraint=models.UniqueConstraint(fields=('initiative', 'name'), name='unique field risk name'),
        ),
        migrations.AddConstraint(
            model_name='initiativespropertiesfields',
            constraint=models.UniqueConstraint(fields=('initiative', 'title'), name='unique field properties title'),
        ),
        migrations.AddConstraint(
            model_name='initiativesmetricsfields',
            constraint=models.UniqueConstraint(fields=('initiative', 'metric'), name='unique field metric title'),
        ),
        migrations.AddConstraint(
            model_name='initiativesaddfields',
            constraint=models.UniqueConstraint(fields=('initiative', 'title'), name='unique field initiatives title'),
        ),
        migrations.AddConstraint(
            model_name='initiatives',
            constraint=models.UniqueConstraint(fields=('project', 'name'), name='unique name initiatives'),
        ),
        migrations.AddConstraint(
            model_name='eventsaddfields',
            constraint=models.UniqueConstraint(fields=('event', 'title'), name='unique field event title'),
        ),
        migrations.AddConstraint(
            model_name='events',
            constraint=models.UniqueConstraint(fields=('initiative', 'name'), name='unique event initiative name'),
        ),
        migrations.AddConstraint(
            model_name='eventmetricsfields',
            constraint=models.UniqueConstraint(fields=('event', 'metric'), name='unique event field metric title'),
        ),
    ]