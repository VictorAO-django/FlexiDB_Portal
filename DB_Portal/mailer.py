from django.core.mail import send_mail,get_connection

def portal_send_mail(subject, message, recipent_email):
    sender_email = 'DB Portal@gmail.com'
    receiver_email_list = [recipent_email] 
    connection = get_connection('django.core.mail.backends.console.EmailBackend')
    
    send_mail(subject,message,sender_email,receiver_email_list, connection=connection)