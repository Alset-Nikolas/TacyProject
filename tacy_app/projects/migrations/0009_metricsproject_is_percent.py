# Generated by Django 4.1.5 on 2023-01-15 21:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0008_projectfiles_file_name_alter_projectfiles_file'),
    ]

    operations = [
        migrations.AddField(
            model_name='metricsproject',
            name='is_percent',
            field=models.BooleanField(default=1, help_text='Вывод в процентах'),
            preserve_default=False,
        ),
    ]