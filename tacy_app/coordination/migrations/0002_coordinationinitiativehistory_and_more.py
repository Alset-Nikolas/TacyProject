# Generated by Django 4.1.2 on 2022-11-15 20:35

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('components', '0024_initiatives_status'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('coordination', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='CoordinationInitiativeHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Дата и время сообщения')),
                ('text', models.CharField(max_length=300)),
                ('action', models.CharField(choices=[('Sent for approval', 'Sent for approval'), ('Left a comment', 'Left a comment'), ('Agreed', 'Agreed'), ('Withdrew the initiative', 'Withdrew the initiative')], max_length=30)),
                ('author_text', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='author_comment', to=settings.AUTH_USER_MODEL)),
                ('coordinator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('initiative', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='history_coordination', to='components.initiatives')),
                ('status', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='components.settingsstatusinitiative')),
            ],
            options={
                'db_table': 'coordination_initiative_history',
            },
        ),
        migrations.CreateModel(
            name='StagesCoordinationInitiative',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('coordinator_stage', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('initiative', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='stages_coordination', to='components.initiatives')),
                ('status', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='components.settingsstatusinitiative')),
            ],
            options={
                'db_table': 'stages_coordination_initiative',
            },
        ),
        migrations.DeleteModel(
            name='CoordinationInitiative',
        ),
    ]
