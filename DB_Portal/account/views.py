from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.utils.http import urlsafe_base64_encode,urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.urls import reverse

from authenticate.models import Profile
from decorator import ensure_login


def SignupView(request):
    template = 'signup.html'
    return render(request, template)

def LoginView(request):
    template = 'login.html'
    return render(request, template)

def ResetPasswordView(request):
    template = 'reset-password.html'
    encoded_id = request.GET.get('encodedId', None)
    token = request.GET.get('token', None)
    try:
        assert encoded_id is not None
        assert token is not None
        return render(request, template)
        
    except AssertionError:
        return redirect('http://localhost:8000/portal/page-not-found/')


@ensure_login('portal/dashboard/')
def DashboardView(request):
    template = 'base.html'
    user = request.user
    context = {
        'name': f'{user.first_name} {user.last_name}'.capitalize(),
        'username': user.username,
        'role': 'developer' if user.is_developer else 'organization',
    }
    #set the search history cookie
    response = HttpResponse()
    response.set_cookie('searchhistory', user.recent_search, max_age=3600)
    
    return render(request, template, context=context)
    
    
@ensure_login('portal/notification/')
def NotificationView(request):
    template = 'child_templates/notification_center.html'
    return render(request, template)


@ensure_login('portal/profile/')
def ProfileView(request):
    template = 'child_templates/profile.html'
    user = request.user
    profile = Profile.objects.get(user=user)
    
    context = {
        'owner': True,
        'prop_image': f'{user.first_name[0]}{user.last_name[0]}'.upper(),
        'name': f'{user.first_name} {user.last_name}'.capitalize(),
        'username': user.username,
        'profile_name': f'{user.first_name} {user.last_name}'.capitalize(),
        'profile_username': user.username,
        'pronoun': 'he/him' if user.gender == 'Male' else 'she/her',
        'role': 'developer' if user.is_developer else 'organization',
        'bio': profile.bio,
        'country': profile.country,
        'email': user.email,
        'website': profile.website,
        'linkedin': profile.linkedIn,
        'github': profile.github,
        'twitter': profile.twitter,
        'stackoverflow': profile.stackoverflow
    }   
    return render(request, template, context=context)


@ensure_login('portal/dashboard/')
def OtherProfileView(request, slug):
    template = 'child_templates/profile.html'
    user = request.user
    try:
        profile = Profile.objects.get(slug=slug)
        other_user = profile.user
        
        context = {
            'owner': False,
            'prop_image': f'{other_user.first_name[0]}{other_user.last_name[0]}'.upper(),
            'name': f'{user.first_name} {user.last_name}'.capitalize(),
            'username': user.username,
            'profile_name': f'{other_user.first_name} {other_user.last_name}'.capitalize(),
            'profile_username': other_user.username,
            'pronoun': 'he/him' if other_user.gender == 'Male' else 'she/her',
            'role': 'developer' if user.is_developer else 'organization',
            'bio': profile.bio,
            'country': profile.country,
            'email': other_user.email,
            'website': profile.website,
            'linkedin': profile.linkedIn,
            'github': profile.github,
            'twitter': profile.twitter,
            'stackoverflow': profile.stackoverflow
        }   
        
        if slug not in user.recent_search:
            user.recent_search = f'{user.recent_search}&{slug}'
            print(user.recent_search)
            user.save()
            
        #set the search history cookie
        response = render(request, template, context=context)
        response.set_cookie('searchhistory', f'{user.recent_search}', max_age=3600)
        
        return response
    
    except Profile.DoesNotExist:
        return redirect('login')