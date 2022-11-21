# Generated by Django 4.1.2 on 2022-10-26 16:56

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0048_project_files'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProjectGrafics',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('metric', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='projects.metricsproject')),
                ('project', models.ForeignKey(blank=True, help_text='Проект к которому относятся графики', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='grafics', to='projects.project', verbose_name='Проект')),
                ('propertie', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='projects.propertiesproject')),
            ],
        ),
    ]
