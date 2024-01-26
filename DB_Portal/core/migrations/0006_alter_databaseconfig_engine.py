# Generated by Django 4.2.9 on 2024-01-26 05:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0005_permission'),
    ]

    operations = [
        migrations.AlterField(
            model_name='databaseconfig',
            name='engine',
            field=models.CharField(choices=[('mysql', 'mysql'), ('postgres', 'postgres'), ('mssql+pyodbc', 'mssql+pyodbc'), ('cx_oracle', 'cx_orcle'), ('mariadb', 'mariadb'), ('mysql_aurora', 'mysql_aurora'), ('mysql+mysqldb', 'mysql+mysqldb')], max_length=50),
        ),
    ]