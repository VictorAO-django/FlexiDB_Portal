from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework import status

from django.shortcuts import redirect
from django.urls import reverse

from core.models import DatabaseConfig, Permission
from permissions import DatabasePermission


def ensure_db_permission(permission_type):
    def my_decorator(func):
        def wrapper(self, request, *args, **kwargs):
            user = Token.objects.get(key=request.auth).user
            #try to get database_id from the request body
            try_database_id_1 = request.data.get('database_id', None)
            #try to get database_id from query parameters 
            try_database_id_2 = request.query_params.get('database_id', None)
            
            try:
                #ensure that the two trials does not return to None
                assert (try_database_id_1 is not None) or (try_database_id_2 is not None), "Provide the database_id according to the documentation"
                #choose the one that is provided
                database_id = try_database_id_1 if try_database_id_1 else try_database_id_2
                
                database = DatabaseConfig.objects.get(database_id=database_id)
                DatabasePermission(user, database, permission_type).check_permission()
                   
                kwargs['database'] = database
                kwargs['user'] = user
                return  func(self, request, *args, **kwargs)
        
            except AssertionError as err:
                return Response({'detail':str(err)}, status=status.HTTP_403_FORBIDDEN)
            
            except DatabaseConfig.DoesNotExist:
                return Response({'detail':'No such database'}, status=status.HTTP_403_FORBIDDEN)
            
            except Permission.DoesNotExist:
                return Response({'detail':'No permission on this database'}, status=status.HTTP_403_FORBIDDEN)
        
        return wrapper
    return my_decorator


def ensure_login(nextURL):
    def my_decorator(func):
        def wrapper(request, *args, **kwargs):
            if request.user != None:                
                return func(request, *args, **kwargs)
            else:
                url = reverse('login')
                url = (url + f'?next={nextURL}') if nextURL != "" else url
                return redirect(url)
        return wrapper
    return my_decorator