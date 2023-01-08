# Generated by Django 4.1.2 on 2023-01-04 12:34

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='NotificationsUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateTimeField(default=django.utils.timezone.now, help_text='Введите дати время новости', verbose_name='Дата и время новости')),
                ('text', models.CharField(max_length=800)),
            ],
            options={
                'ordering': ['-date'],
            },
        ),
    ]
