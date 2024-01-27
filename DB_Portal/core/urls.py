"""
URL configuration for DB_Portal project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from .views import *

urlpatterns = [
    path('create_db/', CreateDatabaseInstance.as_view()),
    #path('try_connect_db/', TryConnect.as_view()),
    path('connect_db/', Connect_To_DB.as_view()),
    path('permission/grant/', GrantPermission.as_view()),
    path('permission/', Get_UpdatePermission().as_view()),
    
    #databases
    path('databases/', DatabasesList.as_view()),
    path('database/tables/', DatabaseTablesList.as_view()),
]
