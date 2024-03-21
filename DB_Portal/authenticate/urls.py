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
    path('register/', RegistrationView.as_view()),
    path('login/', LoginView.as_view()),
    path('signout/', LogoutView.as_view()),
    path('account-verification/<str:encoded_id>/<str:token>/', AccountVerificationView.as_view()),
    path('verification-link/', VerificationLinkView.as_view()),
    path('forget-password/', ForgetPasswordView.as_view()),
    path('reset-password/<str:encoded_id>/<str:token>/', PasswordResetView.as_view()),
    path('change-password/', ChangePasswordView.as_view()),
    path('delete-account/', DeleteAccountView.as_view()),
    path('details/', RetrieveDataView.as_view()),
    
    #avatar
    path('avatar/', AvatarView.as_view()),
    
    #ip actions
    path('ip/', IpAccess.as_view()),
    
    #search
    path('search-user/', SearchUser.as_view())
]
