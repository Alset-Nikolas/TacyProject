# Generated by Django 4.1.5 on 2023-01-17 14:47

import components.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('components', '0007_alter_initiativesfiles_file_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='initiativesfiles',
            name='file_name',
            field=models.CharField(default=1, max_length=300),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='initiativesfiles',
            name='file',
            field=models.FileField(null=True, upload_to=components.models.directory_path),
        ),
    ]