from django.core.mail import send_mail,get_connection
from django.utils.http import urlsafe_base64_encode

from authenticate.models import User, EmailVerificationToken

def portal_send_mail(subject, message, recipent_email):
    sender_email = 'DB Portal@gmail.com'
    receiver_email_list = [recipent_email] 
    connection = get_connection('django.core.mail.backends.console.EmailBackend')
    
    send_mail(subject,message,sender_email,receiver_email_list, connection=connection)
    
class Mailer:
    def __init__(self, receiver, **kwargs):
        self.receiver = receiver #it must be a list datatype
        self.subject = ''
        self.message = ''
    
    def send(self):
        portal_send_mail(self.subject, self.message, self.receiver)
       
    def ip_access(self):
        user = User.objects.get(email=self.receiver[0])
        self.subject = 'Unknow Ip address'
        self.message = f'{user.first_name}, An unknown device tried to login to your account. Was it you?\nKindly grant or ban this device '
        self.message += "\nNote: once you ban a certain ip address/device, you cannot undo it."
        encoded_id = urlsafe_base64_encode(bytes(str(user.pk),encoding="utf-16"))#encode the user PK for transfer over url
        self.message += "\nlocalhost:8000/portal/auth/ip/"
        
        self.send()
    
    def email_verification(self):
        user = User.objects.get(email=self.receiver[0]) #get user instance
        emailToken =  EmailVerificationToken.objects.get(user=user).token #get or create verification token
            
        encoded_id = urlsafe_base64_encode(bytes(str(user.id),encoding="utf-16"))#encode the user PK for transfer over url
        verification_url = f"http://localhost:8000/portal/auth/account-verification/{encoded_id}/{emailToken}/"
        
        self.subject = 'FlexiDB Portal account verification'
        self.message = "For security reasons, we've sent you this email which contains a link to verify your account"
        self.message += f'\n{verification_url}'
        self.send()
        
        