from core.models import DatabaseConfig, Permission
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework import status

import json

PERMISSION_TYPES = {
    'read': ['read'],
    'read-edit': ['read', 'read-edit'],
    'read-edit-create': ['read', 'read-edit', 'read-edit-create'],
    'read-edit-create-delete': ['read', 'read-edit', 'read-edit-create','read-edit-create-delete']
}

def ensure_db_permission(permission_type):
    def my_decorator(func):
        def wrapper(self, request, *args, **kwargs):
            user = Token.objects.get(key=request.auth).user
            try_database_id_1 = request.data.get('database_id', None)
            try_database_id_2 = request.query_params.get('database_id', None)
            
            try:
                assert (try_database_id_1 is not None) or (try_database_id_2 is not None), "Provide the database_id according to the documentation"
                database_id = try_database_id_1 if try_database_id_1 else try_database_id_2
                
                database = DatabaseConfig.objects.get(database_id=database_id)
                
                if database.user == user:
                    kwargs['is_owner'] = True
                    pass
                else:
                    permission = Permission.objects.get(user=user, database=database)
                    user_permission = permission.permission
                    function_permission_type = PERMISSION_TYPES.get(permission_type, None)
                    
                    assert function_permission_type is not None, "Provide a valid permission_type, 'read', 'read-edit', 'read-edit-create', 'read-edit-create-delete'"
                    
                    if user_permission in function_permission_type:
                        kwargs['permission'] = permission
                        pass
                    else:
                        return Response({'detail':"You're not permitted to do this"}, status=status.HTTP_403_FORBIDDEN)
                    
                kwargs['database'] = database
                kwargs['user'] = user
                return Response(json.dumps(func(self, request, *args, **kwargs)))
                
            except AssertionError as err:
                return Response({'detail':str(err)}, status=status.HTTP_403_FORBIDDEN)
            
            except DatabaseConfig.DoesNotExist:
                return Response({'detail':'No such database'}, status=status.HTTP_403_FORBIDDEN)
            
            except Permission.DoesNotExist:
                return Response({'detail':'No permission on this database'}, status=status.HTTP_403_FORBIDDEN)
        
        return wrapper
    return my_decorator