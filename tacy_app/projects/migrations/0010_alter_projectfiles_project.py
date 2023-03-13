# Generated by Django 4.1.5 on 2023-03-12 08:57

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0009_alter_communityaddfields_options_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='projectfiles',
            name='project',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='files', to='projects.project', verbose_name='Проект'),
            preserve_default=False,
        ),
    ]