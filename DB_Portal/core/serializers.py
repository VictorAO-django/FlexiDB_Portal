from rest_framework import serializers
from .models import DatabaseConfig, Permission

class CreateDatabaseConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatabaseConfig
        fields = ['project_name', 'engine', 'username', 'password', 'host', 'port', 'database', 'parameters']

class ConnectionSerializer(serializers.Serializer):
    database_id = serializers.UUIDField(write_only=True)
    
class PermissionSerializer(serializers.ModelSerializer):
    database = serializers.CharField(write_only=True)
    user = serializers.CharField(write_only=True)
    class Meta:
        model = Permission
        fields = ['database', 'user', 'permission']
        
class DatabaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatabaseConfig
        fields = ['database_id', 'project_name', 'url']
    
class GetDataFromPermissionSerializer(serializers.ModelSerializer):
    database_id = serializers.CharField(source='database.database_id', read_only=True)
    project_name = serializers.CharField(source='database.project_name', read_only=True)
    url = serializers.CharField(source='database.url', read_only=True)
    class Meta:
        model = Permission
        fields = ['database_id', 'project_name', 'url', 'permission']