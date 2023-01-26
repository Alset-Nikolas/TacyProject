# Generated by Django 4.1.5 on 2023-01-25 19:16

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='CoordinationInitiativeHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Дата и время сообщения')),
                ('text', models.CharField(max_length=800)),
                ('action', models.CharField(choices=[('Отправить на согласование', 'Отправить на согласование'), ('Новый комментарий', 'Новый комментарий'), ('Инициатива согласована', 'Инициатива согласована'), ('Служебное сообщение', 'Служебное сообщение'), ('Инициатива отозвана', 'Инициатива отозвана')], max_length=30)),
            ],
            options={
                'db_table': 'coordination_initiative_history',
                'ordering': ['date'],
            },
        ),
        migrations.CreateModel(
            name='StagesCoordinationInitiative',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('activate', models.BooleanField(default=False)),
            ],
            options={
                'db_table': 'stages_coordination_initiative',
            },
        ),
    ]
