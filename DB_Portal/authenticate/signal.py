from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver, Signal
from django.utils.text import slugify

from .models import Profile, User, EmailVerificationToken
from mailer import Mailer

custom_post_save = Signal()

def user_post_save(sender, instance, country, **kwargs):
    emailToken = EmailVerificationToken.objects.create(user=instance)
    profile = Profile.objects.create(user=instance, country=country)
    Mailer([instance.email]).email_verification()
    
custom_post_save.connect(user_post_save, sender=User)

@receiver(post_save, sender=Profile)
def profile(sender, instance, created, **kwargs):
    if created:
        instance.slug = slugify(instance.user.username)
        instance.save()
        print(slugify(instance.user.username))