# Generated by Django 4.2.9 on 2024-01-25 18:36

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0005_user_banned_ip_user_denied_ip_alter_user_ip_address'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='user_id',
            field=models.UUIDField(blank=True, default=uuid.uuid4, null=True),
        ),
    ]
