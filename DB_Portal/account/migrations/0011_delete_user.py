# Generated by Django 4.2.9 on 2024-01-26 03:55

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0010_user_gender'),
    ]

    operations = [
        migrations.DeleteModel(
            name='User',
        ),
    ]
