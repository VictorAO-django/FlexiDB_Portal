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

from permissions import IsVerified, IpIsValid
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
            



class TryConnect(APIView):
    #authentication_classes = [BearerTokenAuthentication]
    #permission_classes = [IsAuthenticated, IsVerified, IpIsValid]'
    @swagger_auto_schema(
        operation_summary="Test connection",
        operation_id="try-connecting",
        request_body=TryConnectionSerializer,
        responses={
            201: "Successful, Product added to cart!",
            400: "No product_id is provided in request body, and invaid product_id",
            404: "NotFound - This is because the product no longer exist in the inventory",
            409: "Conflit - Product already in the cart"
        }
    )
    def post(self, request):
        data = {}
        serializer = TryConnectionSerializer(data=request.data) 
        serializer.is_valid()
        database = serializer.validated_data['database']
        
        #test the database connection
        connect_db(database).try_connect() 
        
        data['detail'] = "Connection Successful"
        return Response(data, status=status.HTTP_200_OK)
        
        
        
    
class Connect_To_DB(APIView):
    authentication_classes = [BearerTokenAuthentication]
    permission_classes = [IsAuthenticated, IsVerified, IpIsValid]
    
    def post(self, request):
        data = {}
        serializer = ConnectionSerializer(data=request.data)
        database_id = serializer.validated_data['database_id']
        
        #get the user instance
        user = Token.objects.get(key=request.auth).user 
        try:
            #get the database url
            database = DatabaseConfig.objects.get(user=user, database_id=database_id).generate_url()
            #try connecting to the database
            connect = connect_db(database)
            if connect == True:
                data['detail'] = "Connection Successful"
                return Response(data, status=status.HTTP_200_OK)
            else:
                raise CannotConnect
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
            
            assert database.user == user
            
            serializer.validated_data['user'] = developer
            serializer.validated_data['database'] = database
            return super().perform_create(serializer)
    
        except AssertionError:
            return Response({"detail":"you don't have access to give permission on this database"}, status=status.HTTP_401_UNAUTHORIZED)
        
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
        responses={
            200: "Login successful, User Authenticated!",
            400: "Wrong Password",
            401: "Email not verified",
            404: "No user found with this email",
        }
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