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

from .serializers import *


def RegistrationView(request):
    template = 'email_templates/ip.html'
    context = {
        'title':'registration',
        'recipent_name': 'HayWhy',
        'subject': 'Unknow Ip address',
        'message': 'An unknown device tried to login to your account. Was it you?\n Kindly grant or ban this device'
    }
    return render(request, template, context=context)

def HomeView(request):
    template = 'base.html'
    context = {
        'username':'olusola',
        'role': 'company',
    }
    return render(request, template, context=context)

def LoginView(request):
    template = 'login.html'
    return render(request, template)