# Generated by Django 4.2.9 on 2024-03-21 14:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authenticate', '0016_profile_city_profile_postal_code_profile_skills_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='phone',
            field=models.CharField(blank=True, max_length=20),
        ),
        migrations.AlterField(
            model_name='emailverificationtoken',
            name='token',
            field=models.CharField(default='niym4w04KJEtyfJ73qIBFCZkeyNKTvLoBmelNg2J', max_length=100, unique=True),
        ),
        migrations.AlterField(
            model_name='profile',
            name='bio',
            field=models.TextField(blank=True),
        ),
    ]
