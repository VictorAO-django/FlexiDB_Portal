from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import *

class UserAdmin(BaseUserAdmin):
    fieldsets=(
        (None, {'fields': ('username', 'password')}),
        (('Personal Info'), {'fields': ('first_name','last_name','gender','email','user_id')}),
        (('Permissions'), {'fields': ('is_active', 'is_verified', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (('Ip Address'), {'fields': ('ip_address', 'banned_ip')}),
        (('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    list_display = ('email', 'username', 'is_verified','ip_address')
    
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'country')
    readonly_fields = ('slug',)
    

admin.site.register(User, UserAdmin)
admin.site.register(Profile, ProfileAdmin)
# Register your models here.
