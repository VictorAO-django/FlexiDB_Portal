import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

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
        user.save(using=self._db)
        return user

class User(AbstractUser):
    user_id = models.UUIDField(default=uuid.uuid4, blank=False, unique=True)
    email = models.EmailField(unique=True, blank=False) 
    username = models.CharField(unique=True, blank=False, max_length=255)
    organization = models.CharField(unique=True, blank=True, null=True, max_length=255)
    is_developer = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    ip_address = models.TextField(blank=True, null=True)
    denied_ip = models.TextField(blank=True, null=True)
    banned_ip = models.TextField(blank=True, null=True)
    
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]
    objects = UserManager()
    
    def __str__(self):
        return self.username
    
# Create your models here.
