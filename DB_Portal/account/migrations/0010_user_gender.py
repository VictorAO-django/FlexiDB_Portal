# Generated by Django 4.2.9 on 2024-01-26 03:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0009_alter_user_user_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='gender',
            field=models.CharField(default='Female', max_length=10),
        ),
    ]