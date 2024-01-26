from django.core.mail import send_mail,get_connection
from django.utils.http import urlsafe_base64_encode

from authenticate.models import User

def portal_send_mail(subject, message, recipent_email):
    sender_email = 'DB Portal@gmail.com'
    receiver_email_list = [recipent_email] 
    connection = get_connection('django.core.mail.backends.console.EmailBackend')
    
    send_mail(subject,message,sender_email,receiver_email_list, connection=connection)
    
class Mailer:
    def __init__(self, receiver, **kwargs):
        self.receiver = receiver #it must be a list datatype
        
    def ip_access(self):
        user = User.objects.get(email=self.receiver[0])
        subject = 'Unknow Ip address'
        message = f'{user.first_name}, An unknown device tried to login to your account. Was it you?\nKindly grant or ban this device '
        message += "\nNote: once you ban a certain ip address/device, you cannot undo it."
        encoded_id = urlsafe_base64_encode(bytes(str(user.pk),encoding="utf-16"))#encode the user PK for transfer over url
        message += "\nlocalhost:8000/portal/auth/ip/"
        
        portal_send_mail(subject, message, self.receiver)
        
        