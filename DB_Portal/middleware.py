from django.contrib.auth.models import AnonymousUser
from django.utils.deprecation import MiddlewareMixin
from rest_framework.authtoken.models import Token

class TokenInclusionMiddleware(MiddlewareMixin):
    def process_request(self, request):
        #Extract Token from cookie
        token = request.COOKIES.get('authToken')
        
        #Add token to request header
        if token:
            request.META['HTTP_AUTHORIZATION'] = f'Bearer {token}'
            

class TokenAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        #Exclude django admin URLS from token authentication
        
        if request.path.startswith('/admin/'):
            return self.get_response(request)
        
        #check if the request has a token 
        token_key = request.META.get('HTTP_AUTHORIZATION')
            
        if token_key and token_key.startswith('Bearer '):
            try:
                token = Token.objects.get(key=token_key.split(' ')[1])
                request.user = token.user
            except Token.DoesNotExist:
                #invalid token
                request.user = None
        else:
            #no token provided
            request.user = None
                
        response = self.get_response(request)
        return response