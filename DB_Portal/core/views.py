from django.shortcuts import render
from django.shortcuts import redirect, render
from django.utils.http import urlsafe_base64_encode,urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator

from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework import status
from rest_framework.generics import CreateAPIView, RetrieveAPIView, ListAPIView, UpdateAPIView, DestroyAPIView, RetrieveUpdateAPIView
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import AuthenticationFailed

from authenticate.models import *
from .serializers import *
from .models import DatabaseConfig

from permissions import IsVerified, IpIsValid, DatabasePermission
from authentication import BearerTokenAuthentication
from connections import connect_db
from exceptions import *
from helper import generate



class CreateDatabaseInstance(CreateAPIView):
    authentication_classes = [BearerTokenAuthentication]
    permission_classes = [IsAuthenticated, IsVerified, IpIsValid]
    queryset = DatabaseConfig.objects.all()
    serializer_class = CreateDatabaseConfigSerializer
    
    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        response = response.data
        
        return Response({'detail':generate(**response).url()}, status=status.HTTP_200_OK)
    
    def perform_create(self, serializer):
        user = Token.objects.get(key=self.request.auth).user
        serializer.validated_data['user'] = user

        base_url = generate(**serializer.validated_data).base_url()
        url = generate(**serializer.validated_data).url()
    
        try:
            database = DatabaseConfig.objects.get(base_url=base_url)
            if user == database.user:
                raise RegisteredByYou()
            else:
                raise RegisteredBySomeone()
        except DatabaseConfig.DoesNotExist: 
            serializer.validated_data['base_url'] = base_url
            serializer.validated_data['url'] = url
            return super().perform_create(serializer)
        
        
        
    
class Connect_To_DB(APIView):
    authentication_classes = [BearerTokenAuthentication]
    permission_classes = [IsAuthenticated, IsVerified, IpIsValid]
    
    @swagger_auto_schema(
        operation_summary="Connection Endpoint",
        operation_id="connect",
        request_body=ConnectionSerializer,
    )
    def post(self, request):
        data = {}
        serializer = ConnectionSerializer(data=request.data)
        database_id = serializer.validated_data['database_id']
        
        #get the user instance
        user = Token.objects.get(key=request.auth).user 
        try:
            #get the database url
            database = DatabaseConfig.objects.get(user=user, database_id=database_id).url
            
            connect_db(database).try_connect() #try connecting to the database
            
            data['detail'] = "Connection Successful"
            return Response(data, status=status.HTTP_200_OK)
            
        except DatabaseConfig.DoesNotExist:
            raise NoSuchDatabase()
    


class GrantPermission(CreateAPIView):
    authentication_classes = [BearerTokenAuthentication]
    permission_classes = [IsAuthenticated, IsVerified, IpIsValid]
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    
    def perform_create(self, serializer):
        user = Token.objects.get(key=self.request.auth).user
        try:
            developer = User.objects.get(user_id = serializer.validated_data['user'])
            database = DatabaseConfig.objects.get(database_id = serializer.validated_data['database'])
            
            assert database.user == user, "you don't have access to give permission on this database"
            
            serializer.validated_data['user'] = developer
            serializer.validated_data['database'] = database
            return super().perform_create(serializer)
    
        except AssertionError as err:
            return Response({"detail":str(err)}, status=status.HTTP_401_UNAUTHORIZED)
        
        except User.DoesNotExist:
            raise InvalidUser()
        
        except DatabaseConfig.DoesNotExist:
            raise InvalidDatabase()



class Get_UpdatePermission(APIView):
    authentication_classes = [BearerTokenAuthentication]
    permission_classes = [IsAuthenticated, IsVerified, IpIsValid]
    
    def get(self, request):
        user = Token.objects.get(key=self.request.auth).user
        try:
            database = DatabaseConfig.objects.get(database_id = request.data['database'])
            assert database.user == user
            permissions = Permission.objects.filter(database=database)
            
            return Response({'detail':permissions}, status=status.HTTP_200_OK)
            
        except AssertionError:
            return Response({"detail":"you don't have access to get this data on this database"}, status=status.HTTP_401_UNAUTHORIZED)
        
    
    @swagger_auto_schema(
        operation_summary="Update Database Permission Endpoint",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'developer': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_EMAIL),
                'database': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_PASSWORD),
                'permission': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_PASSWORD),
            },
            required=['developer', 'database', 'permission'],
        ),
        operation_id="login",
    )
    def patch(self, request):
        user = Token.objects.get(key=self.request.auth).user
        try:
            developer = User.objects.get(user_id = request.data['user'])
            database = DatabaseConfig.objects.get(database_id = request.data['database'])
            
            assert database.user == user
            permission = Permission.objects.get(user=developer, database=database)
            
            permission.permission = request.data['permission']
            permission.save()
            
        except AssertionError:
            return Response({"detail":"you don't have access to specify permissions for this database"}, status=status.HTTP_401_UNAUTHORIZED)
        
        except User.DoesNotExist:
            raise InvalidUser()
        
        except DatabaseConfig.DoesNotExist:
            raise InvalidDatabase()
        
        except Permission.DoesNotExist:
            return Response({'detail':'the developer does not have permission to use the database'}, status=status.HTTP_403_FORBIDDEN)
        
        
        
        
class DatabasesList(ListAPIView):
    authentication_classes = [BearerTokenAuthentication]
    permission_classes = [IsAuthenticated, IsVerified, IpIsValid]
    serializer_class = DatabaseSerializer
    
    @swagger_auto_schema(
        operation_summary="Update Database Permission Endpoint",
        operation_id="login",
        responses={
            200: "OK", 
            'owned':DatabaseSerializer(many=True).data, 
            'permitted': GetDataFromPermissionSerializer(many=True).data
        }
    )
    def list(self, request, *args, **kwargs):
        user = Token.objects.get(key=self.request.auth).user
        queryset_1 = DatabaseConfig.objects.filter(user=user)
        queryset_2 = Permission.objects.filter(user=user)
        
        serializer_1 = DatabaseSerializer(queryset_1, many=True)
        serializer_2 = GetDataFromPermissionSerializer(queryset_2, many=True)
        
        response = {
            'owned':serializer_1.data,
            'permitted': serializer_2.data
        }
        
        return Response(response,status=status.HTTP_200_OK)
    
    
    

class DataTables(APIView):
    authentication_classes = [BearerTokenAuthentication]
    permission_classes = [IsAuthenticated, IsVerified, IpIsValid]
    
    @swagger_auto_schema(
        operation_summary="Retrieve Tables Endpoint",
        operation_id="tables",
    )
    def get(self, request):
        data = {}
        database_id = request.query_params.get('database_id', None)
        
        user = Token.objects.get(key=request.auth).user #get the user instance
        try:
            assert database_id is not None, "No database_id provided"
            
            database = DatabaseConfig.objects.get(database_id=database_id)
            if database.user == user: #if this request is made by the owner of the database
                pass
            else:
                DatabasePermission(database, user).check_permission() #ensure the user has appropriate permission
            
            database_url = database.url #get the database url
            
            connect = connect_db(database_url).retrieve_table_names() #retrieve table names
    
            data['detail'] = connect
            return Response(data, status=status.HTTP_200_OK)

        except AssertionError as err:
            return Response({'detail':str(err)}, status=status.HTTP_403_FORBIDDEN)
        
        except DatabaseConfig.DoesNotExist:
            raise NoSuchDatabase()