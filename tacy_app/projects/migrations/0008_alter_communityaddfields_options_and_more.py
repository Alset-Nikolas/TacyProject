# Generated by Django 4.1.5 on 2023-02-18 17:02

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0007_project_unique name project'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='communityaddfields',
            options={'ordering': ['value']},
        ),
        migrations.AlterModelOptions(
            name='propertiesitemsproject',
            options={'ordering': ['value']},
        ),
        migrations.AlterModelOptions(
            name='propertiesproject',
            options={'ordering': ['title']},
        ),
        migrations.AlterModelOptions(
            name='сommunityproject',
            options={'ordering': ['date_create']},
        ),
        migrations.AlterModelTable(
            name='communityaddfields',
            table='community_addfields',
        ),
    ]
