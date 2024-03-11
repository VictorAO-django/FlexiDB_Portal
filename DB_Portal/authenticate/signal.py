from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver
from django.utils.text import slugify

from .models import Profile, User


@receiver(post_save, sender=Profile)
def profile(sender, instance, created, **kwargs):
    if created:
        instance.slug = slugify(instance.user.username)
        instance.save()
        print(slugify(instance.user.username))
        
@receiver(post_save, sender=User)
def user(sender, instance, created, **kwargs):
    if created:
        profile = Profile.objects.create(user=instance)