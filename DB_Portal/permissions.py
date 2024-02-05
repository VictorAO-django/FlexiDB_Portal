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
    def __init__(self, db_instance, user_instance, permission):
        self.types = {
            'read': ['read'],
            'read-edit': ['read', 'read-edit'],
            'read-edit-create': ['read', 'read-edit', 'read-edit-create'],
            'read-edit-create-delete': ['read', 'read-edit', 'read-edit-create','read-edit-create-delete']
        }
        self.db_instance = db_instance
        self.user_instance = user_instance
        self.permission = permission
        
        try:
            assert self.permission in self.types , "Invalid Permission Type"
            
        except AssertionError as err:
            raise InvalidPermission()
            
    def check_permission(self):
        try:
            assert db_instance.user == user_instance
            return self.owner_permission()
            
        except AssertionError as err:
            return self.user_permission()
            
    def user_permission(self):
        try:
            #check if the user has permission to accss this database
            DbPermission = Permission.objects.get(user=self.user_instance, database=self.db_instance)
            user_permission = DbPermission.permission #get the user permission on this database
            assert user_permission in self.types[user_permission], "no permission to perform this operation"
            pass
        
        except Permission.DoesNotExist:
            raise NotPermitted()
        
        except AssertionError as err:
            return Response({'detail': str(err)}, status=status.HTTP_403_FORBIDDEN)
            
    def owner_permission(self):
        #owner has all permission 
        pass



            
            
            
        
