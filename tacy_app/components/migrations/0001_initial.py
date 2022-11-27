# Generated by Django 4.1.2 on 2022-11-27 21:22

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='EventMetricsFields',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('value', models.FloatField(max_length=500)),
            ],
            options={
                'db_table': 'event_metrics_fields',
            },
        ),
        migrations.CreateModel(
            name='Events',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text='Введите название мероприятия', max_length=500, verbose_name='Название мероприятия')),
                ('date_start', models.DateField(help_text='Введите дату начала мероприятия', verbose_name='Дата начала мероприятия')),
                ('date_end', models.DateField(help_text='Введите дату окончания мероприятия', verbose_name='Дата окончания мероприятия')),
                ('ready', models.BooleanField(default=False, verbose_name='Отметка об выполнении')),
            ],
            options={
                'db_table': 'events',
            },
        ),
        migrations.CreateModel(
            name='EventsAddFields',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('value', models.CharField(blank=True, max_length=500)),
            ],
            options={
                'db_table': 'event_add_fields',
            },
        ),
        migrations.CreateModel(
            name='Initiatives',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text='Введите название инициативы', max_length=500, verbose_name='Название инициативы')),
                ('current_state', models.CharField(help_text='Введите текущее состояние инициативы', max_length=500, verbose_name='Текущее состояние инициативы')),
                ('reasons', models.CharField(help_text='Введите предпосылкт инициативы', max_length=500, verbose_name='Предпосылки инициативы')),
                ('description', models.CharField(help_text='Введите описание инициативы', max_length=500, verbose_name='Описание инициативы')),
                ('date_registration', models.DateField(default=django.utils.timezone.now, help_text='Введите дату регистрации инициативы', verbose_name='Дата регистраци инициативы')),
                ('date_start', models.DateField(default=django.utils.timezone.now, help_text='Введите дату начала инициативы', verbose_name='min(date start events)')),
                ('date_end', models.DateField(default=django.utils.timezone.now, help_text='Введите дату окончания инициативы', verbose_name='max(date end events)')),
                ('activate', models.BooleanField(default=False, verbose_name='Флаг Инициатва прошла согласование')),
                ('failure', models.BooleanField(default=False, verbose_name='Флаг Инициативу отозвали')),
            ],
            options={
                'db_table': 'initiatives',
            },
        ),
        migrations.CreateModel(
            name='InitiativesAddFields',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('value', models.CharField(max_length=200)),
            ],
            options={
                'db_table': 'initiatives_add_fields',
            },
        ),
        migrations.CreateModel(
            name='InitiativesMetricsFields',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('value', models.FloatField(max_length=200)),
            ],
            options={
                'db_table': 'initiatives_metric_fields',
            },
        ),
        migrations.CreateModel(
            name='InitiativesPropertiesFields',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ],
            options={
                'db_table': 'initiatives_properties_fields',
            },
        ),
        migrations.CreateModel(
            name='Risks',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text='Введите название риска', max_length=200, verbose_name='Название риска')),
            ],
            options={
                'db_table': 'risks',
            },
        ),
        migrations.CreateModel(
            name='RisksAddFields',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('value', models.CharField(blank=True, max_length=500)),
            ],
            options={
                'db_table': 'risk_add_fields',
            },
        ),
        migrations.CreateModel(
            name='SettingsAddFeldsEvent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(help_text='Введите название инициативы', max_length=200, verbose_name='Название дополнительного поля')),
                ('type', models.CharField(choices=[('str', 'string'), ('int', 'integer'), ('float', 'float'), ('date', 'date')], default='str', max_length=200)),
            ],
            options={
                'db_table': 'project_settings_event_add_fields',
            },
        ),
        migrations.CreateModel(
            name='SettingsAddFeldsInitiative',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(help_text='Введите название инициативы', max_length=200, verbose_name='Название дополнительного поля')),
                ('type', models.CharField(choices=[('str', 'string'), ('int', 'integer'), ('float', 'float'), ('date', 'date')], default='str', max_length=30)),
            ],
            options={
                'db_table': 'project_settings_initiative_add_fields',
            },
        ),
        migrations.CreateModel(
            name='SettingsAddFeldsRisks',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(help_text='Введите название инициативы', max_length=200, verbose_name='Название дополнительного поля')),
                ('type', models.CharField(choices=[('str', 'string'), ('int', 'integer'), ('float', 'float'), ('date', 'date')], default='str', max_length=200)),
            ],
            options={
                'db_table': 'project_settings_risk_add_fields',
            },
        ),
        migrations.CreateModel(
            name='SettingsComponents',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ],
        ),
        migrations.CreateModel(
            name='SettingsStatusInitiative',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('value', models.IntegerField(verbose_name='Вес статуса')),
                ('name', models.CharField(help_text='Введите название статуса', max_length=200, verbose_name='Название статуса')),
                ('settings_project', models.ForeignKey(blank=True, help_text='Проект к которому относятся статусы инициативы', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='initiative_status', to='components.settingscomponents', verbose_name='Проект')),
            ],
            options={
                'db_table': 'settings_status_initiative',
            },
        ),
    ]
