# Generated by Django 4.1.5 on 2023-04-17 12:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('components', '0008_remove_events_unique event initiative name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='initiatives',
            name='description',
            field=models.CharField(blank=True, help_text='Введите описание инициативы', max_length=1000, null=True, verbose_name='Описание инициативы'),
        ),
    ]
