from rest_framework import serializers
from .models import DatabaseConfig, Permission

class CreateDatabaseConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatabaseConfig
        fields = ['project_name', 'engine', 'username', 'password', 'host', 'port', 'database', 'parameters']

class TryConnectionSerializer(serializers.Serializer):
    database = serializers.CharField(write_only=True)

class ConnectionSerializer(serializers.Serializer):
    database_id = serializers.IntegerField(write_only=True)
    
class PermissionSerializer(serializers.ModelSerializer):
    database = serializers.CharField(write_only=True)
    user = serializers.CharField(write_only=True)
    class Meta:
        model = Permission
        fields = ['database', 'user', 'permission']