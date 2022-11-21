# Generated by Django 4.1.2 on 2022-10-13 11:28

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('projects', '0008_project_author'),
    ]

    operations = [
        migrations.CreateModel(
            name='СommunityProject',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('param', models.CharField(max_length=10)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='projects.project')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'community_item_tb',
            },
        ),
        migrations.AddField(
            model_name='project',
            name='community',
            field=models.ManyToManyField(related_name='projects', through='projects.СommunityProject', to=settings.AUTH_USER_MODEL),
        ),
    ]
