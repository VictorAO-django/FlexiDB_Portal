from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import *

class UserAdmin(BaseUserAdmin):
    fieldsets=(
        (None, {'fields': ('email', 'password')}),
        (('Personal Info'), {'fields': ('first_name','last_name','username','gender','user_id')}),
        # (('Permissions'), {'fields': ('is_active', 'accept_term', 'is_verified', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (('Permissions'), {'fields': ('is_active', 'accept_term', 'is_verified', 'is_staff', 'is_superuser')}),
        (('Ip Address'), {'fields': ('ip_address', 'banned_ip')}),
        (('Search History'), {'fields': ('recent_search',)}),
        (('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    list_display = ('email', 'username', 'is_verified','ip_address')
    readonly_fields = ('user_id',)
    
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'country')
    readonly_fields = ('slug',)

class EmailVerificationTokenAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'token')
    readonly_fields = ('token',)

admin.site.register(User, UserAdmin)
admin.site.register(Profile, ProfileAdmin)
admin.site.register(EmailVerificationToken, EmailVerificationTokenAdmin)
# Register your models here.
