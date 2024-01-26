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

from .serializers import *
from helper import *
from account.models import *

from permissions import IsVerified, IpIsValid
from authentication import BearerTokenAuthentication
from exceptions import *
from mailer import portal_send_mail


class RegistrationView(APIView): 
    permission_classes=[AllowAny]

    @swagger_auto_schema(
        operation_summary="Sign Up Endpoint",
        operation_description="This is to create an account with babyduct",
        operation_id="account-creation",
        request_body= RegistrationSerializer,
        responses={
            200: "OK - Account Creation Successful",
            403: "Forbidden due to invalid credentials received",
        }
    )
    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        ip = get_client_ip(request)
        data = {}
        
        if serializer.is_valid():
            serializer.validated_data['ip_address'] = ip
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            
            data["status"]='success'
            data["message"]=f'{user.first_name}, mail is sent to your email address for your account verification'
            data["token"]=token.key
            return Response(data,status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_403_FORBIDDEN)
        
        
        
        
class LoginView(APIView):
    permission_classes=[AllowAny,] 
    
    @swagger_auto_schema(
        operation_summary="Login Endpoint",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'email': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_EMAIL),
                'password': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_PASSWORD),
            },
            required=['email', 'password'],
        ),
        operation_id="login",
        responses={
            200: "Login successful, User Authenticated!",
            400: "Wrong Password",
            401: "Email not verified",
            404: "No user found with this email",
        }
    )
    def post(self, request):
        password = request.data["password"]
        data = {}
        try:
            user = User.objects.get(email=request.data['email'])
            if user.check_password(password):
                if user.is_verified:
                    #get the ip_address
                    ip = get_client_ip(request)
                    #if ip is the same as the registered ip
                    if ip == user.ip_address: 
                        pass
                    #if ip has attempted login once and has been denied
                    elif ip in user.denied_ip:
                        raise NewIpAddress()
                    #if ip has been banned
                    elif ip in user.banned_ip:
                        raise  LoginFailed()
                    
                    token, created= Token.objects.get_or_create(user=user)
                    if created:
                        pass
                    else:
                        token.delete()
                        token = Token.objects.create(user=user)
                        
                    data["detail"] = "Login successful, User Authenticated!"
                    data["token"] = token.key     
                    return Response(data,status=status.HTTP_200_OK)
                else:
                    data["detail"] = "please verify your email"     
                    return Response(data,status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)
            else:
                data["detail"] = "Wrong Password"
                return Response(data,status= status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            data["message"] = "No user found with this email"
            return Response(data, status=status.HTTP_404_NOT_FOUND)
        
        
        
class ForgetPasswordView(APIView):
    permission_classes=[AllowAny]
    
    @swagger_auto_schema(
        operation_summary="Forget Password Endpoint",
        operation_description="Authentication token is required",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'email': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_EMAIL),
            },
            required=['email'],
        ),
        operation_id="forget-password",
        responses={
            200: "Successful, Reset link has been sent to email!",
            404: "No user found with this email",
        }
    )
    def post(self, request):
        email = request.data["email"]
        data = {}
        
        try:
            user = User.objects.get(email=email)
            #Generate a unique token for password reset if user exist in database
            token = default_token_generator.make_token(user)
            encoded_id = urlsafe_base64_encode(bytes(str(user.pk),encoding="utf-16"))#encode the user PK for transfer over url

            #set the url for password reset
            reset_url = f'https://localhost:8000/portal/reset-password?encodedId={encoded_id}&token={token}'

            #send the reset url via email
            subject = 'BabyDuct Account Password Reset'
            message = f'Click on the following link to reset your password:\n \n{reset_url}\n ____________________________________________ \n'
            portal_send_mail(subject,message,email)
            
            data["detail"]='Password reset link has been sent to your email'
            return Response(data,status=status.HTTP_200_OK)
        except:
            data["detail"]='No user found with this email in our database'
            return Response(data,status=status.HTTP_404_NOT_FOUND)
        
        
        

class PasswordResetView(APIView):
    permission_classes=[AllowAny]
    
    @swagger_auto_schema(
        operation_summary="Reset Password Endpoint",
        operation_description="Authentication token is required",
        operation_id="reset-password",
        request_body=PasswordResetSerializer,
        responses={
            201: "Successful, Password Reset Operation Successful!",
            403: "Error - Invalid token or encoded user_id, usually resulting from a non-matching token and encoded_id"
        }
    )
    def post(self,request,encoded_id,token):
        serializer = PasswordResetSerializer(data=request.data)
        data = {}
        
        if serializer.is_valid():
            try:
                #decode the uniqueID from base64
                unique_id = str(urlsafe_base64_decode(encoded_id), encoding="utf-16")
                user = User.objects.get(id=unique_id)

                if default_token_generator.check_token(user,token):
                    new_password = serializer.validated_data['new_password']
                    user.set_password(new_password)
                    user.save()

                    data['detail']="Password reset successfull."
                    return Response(data,status=status.HTTP_201_CREATED)
                else:
                    data['detail']="Invalid Token"
                    return Response(data,status=status.HTTP_403_FORBIDDEN)
            except:
                data['detail']="Invalid user ID."
                return Response(data,status=status.HTTP_403_FORBIDDEN)
        else: 
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        


class ChangePasswordView(APIView):
    authentication_classes = [BearerTokenAuthentication]
    permission_classes = [IsAuthenticated, IsVerified, IpIsValid]

    @swagger_auto_schema(
        operation_summary="Change Password Endpoint",
        operation_description="Authentication token is required",
        operation_id="change-password",
        request_body=ChangePasswordSerializer,
        responses={
            201: "Successful, New Password Created!",
            401: "UnAuthorized - Current Password is wrong",
            400: "BadRequest - Invalid passwords"
        }
    )
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        data = {}
            
        if serializer.is_valid():
            old_password = serializer.validated_data['old_password']
            new_password = serializer.validated_data['new_password']
                
            user = Token.objects.get(key=request.auth).user
            if user.check_password(old_password):
                user.set_password(new_password)
                user.save()

                data["detail"]="Password Change Successful"
                return Response(data,status=status.HTTP_201_CREATED)
            else:
                data["detail"]="Your current password is incorrect"
                return Response(data,status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        
        
        
class DeleteAccountView(APIView):
    authentication_classes = [BearerTokenAuthentication]
    permission_classes = [IsAuthenticated, IsVerified, IpIsValid]
    
    @swagger_auto_schema(
        operation_summary="Change Password Endpoint",
        operation_description="Authentication token is required",
        operation_id="change-password",
        request_body=DeleteAccountSerializer,
        responses={
            200: "Successful, Account Deleted!",
            404: "NotFound - Wrong email or password",
            400: "BadRequest - Invalid parameters"
        }
    )
    def post(self,request):
        serializer = DeleteAccountSerializer(data=request.data)

        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            data = {}
        
            try:
                user = User.objects.get(email = email)
                if user.check_password(password):
                    user.delete()
                    data["detal"] = 'This account has been successfully deleted'
                    
                    return Response(data,status=status.HTTP_200_OK)
                else:
                    data["detail"] = 'This password is wrong'
                    return Response(data,status=status.HTTP_404_NOT_FOUND)
            except:
                data["detail"] = 'This user does not exist'
                return Response(data,status=status.HTTP_404_NOT_FOUND)
        else:
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        
# Create your views here.
