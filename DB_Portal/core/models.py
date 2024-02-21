import uuid

from django.db import models
from authenticate.models import User


class DatabaseConfig(models.Model):
    ENGINE = (
        ("mysql","mysql"),
        ("postgres","postgres"),
        ("mssql+pyodbc","mssql+pyodbc"),
        ("cx_oracle","cx_orcle"),
        ("mariadb","mariadb"),
        ("mysql_aurora","mysql_aurora"),
        ("mysql+mysqldb","mysql+mysqldb"),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    database_id = models.UUIDField(default=uuid.uuid4, unique=True)
    project_name = models.CharField(max_length =50, unique=True)
    engine = models.CharField(choices=ENGINE,max_length=50)
    username = models.CharField(max_length=50)
    password = models.CharField(max_length=50)
    host = models.CharField(max_length=50)
    port = models.IntegerField()
    database = models.CharField(max_length=50, blank=True, null=True)
    parameters = models.CharField(max_length=50, blank=True, null=True)
    base_url = models.URLField(blank=False, unique=True)
    url = models.URLField(blank=False, unique=True)

    table_whitelist = models.JSONField(blank=True, null=True)
              
    def __str__(self):
        return self.url
    
    
class Permission(models.Model):
    PERMISSIONS = (
        ('read', 'read'),
        ('read-edit', 'read-edit'),
        ('read-edit-create', 'read-edit-create'),
        ('read-edit-create-delete', 'read-edit-create-delete')
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    database = models.ForeignKey(DatabaseConfig, on_delete=models.CASCADE)
    permission = models.CharField(choices = PERMISSIONS, default='read', max_length=255)
# Create your models here.
