# Generated by Django 4.1.2 on 2022-10-13 09:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0002_alter_intermediatedateproject_table_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='intermediatedateproject',
            name='date',
            field=models.DateField(help_text='Промежуточная дата'),
        ),
    ]
