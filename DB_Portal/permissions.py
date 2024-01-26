from rest_framework.permissions import BasePermission
from helper import get_client_ip
from exceptions import *

from core.models import Permission

class IsVerified(BasePermission):
    message = "User must be verified"

    def has_permission(self, request, view):
        return request.user and request.user.is_verified

class IpIsValid(BasePermission):
    message = "Ip address is not recognized"
    def has_permission(self, request, view):
        ip = get_client_ip(request)
        return ip in request.user.ip_address

class DatabasePermission:
    def __init__(self, db_instance, user_instance, **kwargs):
        self.choices = ["readonly", "read-edit", "read-edit-create", "read-edit-create-delete"]
        self.db_instance = db_instance
        self.user_instance = user_instance
        self.permission = kwargs.get('permission', None)
        
        try:
            if self.permission:
                assert self.permission in self.choices , "Invalid Permission Type"
            
        except AssertionError as err:
            raise InvalidPermission()
            
    def check_permission(self):
        try:
            #check if the user has permission to accss this database
            DbPermission = Permission.objects.get(user=self.user_instance, database=self.db_instance)
            DbPermission = DbPermission.permission #get the user permission on this database
            if self.permission: #if permission is provided
                assert DbPermission == self.permission #ensure the user has the permission
            pass
        
        except Permission.DoesNotExist:
            raise NotPermitted()
        
        except AssertionError:
            raise NotPermitted()
            
        
