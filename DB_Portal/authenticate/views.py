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
from authenticate.models import *

from permissions import IsVerified, IpIsValid
from authentication import BearerTokenAuthentication
from exceptions import *
from mailer import portal_send_mail, Mailer


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
            
            data["status"]='success'
            data["detail"]=f'{user.first_name}, mail is sent to your email address for your account verification'
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
                    #if ip has been banned
                    elif ip in user.banned_ip:
                        raise LoginFailed()
                    else:
                        mailer = Mailer([user.email]).ip_access()
                        data["message"] = f"{user.first_name}, a message has been sent to your email to confirm login from this strange device"
                        return Response(data, status=status.HTTP_403_FORBIDDEN)
                    
                    token, created= Token.objects.get_or_create(user=user)
                    if created:
                        pass
                    else:
                        token.delete()
                        token = Token.objects.create(user=user)
                        
                    data["detail"] = "Login successful, we'll redirect you to dashboard"
                    data["token"] = token.key     
                    return Response(data,status=status.HTTP_200_OK)
                else:
                    data["detail"] = "please verify your email"     
                    return Response(data,status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)
            else:
                data["detail"] = "Wrong Password"
                return Response(data,status= status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            data["detail"] = "No user found with this email"
            return Response(data, status=status.HTTP_404_NOT_FOUND)
        
        
        
class LogoutView(APIView):
    permission_classes = [IsAuthenticated, IpIsValid]
    
    @swagger_auto_schema(
        operation_summary="Signout Endpoint",
        operation_id="signout",
        responses={
            200: "Signed out",
        }
    )
    def delete(self, request, *args, **kwargs):
        token = Token.objects.get(user=request.user)
        token.delete()
        return Response({'detail': "Signed out"}, status=status.HTTP_200_OK)


class IpAccess(APIView):
    permission_classes = [AllowAny]
    
    @swagger_auto_schema(
        operation_summary="access-ban Ip",
        operation_description="action can be - 'grant' | 'ban'",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'encoded_id': openapi.Schema(type=openapi.TYPE_STRING),
                'user_id': openapi.Schema(type=openapi.TYPE_STRING),
                'ip': openapi.Schema(type=openapi.TYPE_STRING),
                'action': openapi.Schema(type=openapi.TYPE_STRING),
            },
            required=['encoded_id', 'user_id', 'ip', 'action'],
        ),
        operation_id="access-ban Ip",
        responses={
            200: "Successful, Reset link has been sent to email!",
            404: "No user found with this email",
        }
    )
    def post(self, request):
        #tuple of possible actions 
        ACTIONS = ('grant', 'ban')
        
        encoded_id = request.data['encoded_id']
        user_id = request.data['user_id']
        ip = request.data['ip']
        action = request.data['action']
        #decode the id
        decoded_id = str(urlsafe_base64_decode(encoded_id), encoding="utf-16")
        try:
            user = User.objects.get(id=decoded_id, user_id=user_id)
            #ensure its a valid action
            assert action in ACTIONS
            if action == 'grant':
                user.ip_address += f',{ip}'
            if action == 'ban':
                user.banned_ip  += f',{ip}'          
            user.save() #save the instance
            return Response({'detail': f'{action} successful'})
        
        except AssertionError:
            raise CannotBeProcessed()
        except User.DoesNotExist:
            raise CannotBeProcessed()

        
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
                decoded_id = str(urlsafe_base64_decode(encoded_id), encoding="utf-16")
                user = User.objects.get(id=decoded_id)

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
    permission_classes = [IsAuthenticated, IpIsValid]
    
    @swagger_auto_schema(
        operation_summary="Delete Account Endpoint",
        operation_description="Authentication token is required",
        operation_id="delete-account",
        request_body=DeleteAccountSerializer,
        responses={
            200: "Successful, Account Deleted!",
            404: "NotFound - Wrong email or password",
            400: "BadRequest - Invalid parameters"
        }
    )
    def delete(self,request):
        serializer = DeleteAccountSerializer(data=request.data)

        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            data = {}
        
            try:
                user = User.objects.get(email = email)
                if user.check_password(password):
                    user.delete()
                    data["detail"] = 'This account has been successfully deleted'
                    
                    return Response(data,status=status.HTTP_200_OK)
                else:
                    data["detail"] = 'This password is wrong'
                    return Response(data,status=status.HTTP_404_NOT_FOUND)
            except:
                data["detail"] = 'This user does not exist'
                return Response(data,status=status.HTTP_404_NOT_FOUND)
        else:
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        
        
        
        
class RetrieveDataView(RetrieveUpdateAPIView):
    authentication_classes = [BearerTokenAuthentication]
    permission_classes = [IsAuthenticated, IsVerified, IpIsValid]
    queryset = User.objects.all()
    serializer_class = UserSerializer
    http_method_names = ['get', 'patch']
    
    def get_object(self):
        user = Token.objects.get(key=self.request.auth).user
        return user



class SearchUser(ListAPIView):
    #authentication_classes = [BearerTokenAuthentication]
    #permission_classes = [IsAuthenticated, IsVerified, IpIsValid]
    queryset = User.objects.all()
    serializer_class = SearchSerializer
    
    def get_queryset(self):
        filter = {self.filter_key : self.filter_value}
        queryset = User.objects.filter(**filter)
        return queryset
    
    @swagger_auto_schema(
        operation_summary="Search User Endpoint",
        operation_description="key can be first_name, username, email, organization",
        operation_id="search-user",
        manual_parameters=[
            openapi.Parameter('key', in_=openapi.IN_QUERY, type=openapi.TYPE_STRING),
            openapi.Parameter('value', in_=openapi.IN_QUERY, type=openapi.TYPE_STRING),
        ],
    )
    def get(self, request, *args, **kwargs):
        KEYS = ("first_name", "username", "email", "organization")
        self.filter_key = self.request.query_params.get('key', None)
        self.filter_value = self.request.query_params.get('value', None)
        try:
            assert self.filter_key is not None, "No key"
            assert self.filter_value is not None, "No value"
            assert self.filter_key in KEYS , "you passed an invalid key"
            self.filter_key += '__icontains'
        except AssertionError as err:
            return Response({'detail': str(err)}, status=status.HTTP_406_NOT_ACCEPTABLE)
    
        return super().get(request, *args, **kwargs)
# Create your views here.
