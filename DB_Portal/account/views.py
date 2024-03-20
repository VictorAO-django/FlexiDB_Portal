from django.shortcuts import render
from django.shortcuts import redirect, render
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


@ensure_login('portal/dashboard/')
def DashboardView(request):
    template = 'base.html'
    user = request.user
    context = {
        'name': f'{user.first_name} {user.last_name}'.capitalize(),
        'username': user.username,
        'role': 'developer' if user.is_developer else 'organization',
    }
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
        return render(request, template, context=context)
    
    except Profile.DoesNotExist:
        return redirect('login')