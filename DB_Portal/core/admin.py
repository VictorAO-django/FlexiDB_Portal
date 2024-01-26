from django.contrib import admin
from .models import DatabaseConfig, Permission

class DatabaseConfigAdmin(admin.ModelAdmin):
    list_display = ('email','project_name', '__str__', 'database_id', 'engine')
    
    def email(self, obj):
        return obj.user.email

class PermissionAdmin(admin.ModelAdmin):
    list_display = ('user','database', 'permission')

admin.site.register(DatabaseConfig, DatabaseConfigAdmin)
admin.site.register(Permission, PermissionAdmin)
# Register your models here.
