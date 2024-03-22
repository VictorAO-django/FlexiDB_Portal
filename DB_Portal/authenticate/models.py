import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.text import slugify
from django.utils.crypto import get_random_string

class UserManager(BaseUserManager):
    def create_user(self, email, password, **other_fields):
        email = self.normalize_email(email)
        user = self.model(
            email=email,
            **other_fields
        )
        user.set_password(password)
        user.save()
        return user
    def create_superuser(self, email, password, **other_fields):
        user = self.create_user(
            email = self.normalize_email(email),
            password=password,
            **other_fields
        )
        user.is_admin = True
        user.is_active = True
        user.is_staff = True
        user.is_superuser = True
        user.is_verified = True
        user.accept_term = True
        user.save(using=self._db)
        return user

class User(AbstractUser):
    GENDER = (
        ('Female', 'Female'),
        ('Male','Male')
    )
    user_id = models.UUIDField(default=uuid.uuid4, blank=False, unique=True)
    avatar = models.URLField(blank=True)
    email = models.EmailField(unique=True, blank=False) 
    username = models.CharField(unique=True, blank=False, max_length=255)
    gender = models.CharField(max_length=10, choices=GENDER, default='Female')
    organization = models.CharField(blank=True, null=True, max_length=255)
    is_developer = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    accept_term = models.BooleanField(default=False)
    ip_address = models.TextField(blank=True, null=True)
    banned_ip = models.TextField(blank=True, null=True)
    
    recent_search = models.TextField(blank=True)
    
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]
    objects = UserManager()
    
    def __str__(self):
        return self.email
    
    
    
class Profile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    website = models.URLField(blank=True)
    linkedIn = models.URLField(blank=True)
    github = models.URLField(blank=True)
    twitter = models.URLField(blank=True)
    stackoverflow = models.URLField(blank=True)
    skills = models.TextField(blank=True)
    country = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=255, blank=True)
    postal_code = models.CharField(max_length=10, blank=True)
    
    slug = models.CharField(max_length=80, blank=True, null=True)
    
    def __str__(self):
        return self.user.email
    

class EmailVerificationToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, to_field='id')
    token = models.CharField(default=get_random_string(length=40), max_length=100,unique=True)

    def __str__(self):
        return self.user.email
# Create your models here.
