from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import User

@receiver(post_save, sender=User)
def setup_shipment_address_and_cart(sender, instance, created, **kwargs):
    if created:
        #email verification
        pass