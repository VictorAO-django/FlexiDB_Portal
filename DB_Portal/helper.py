from rest_framework.response import Response
from rest_framework import status

class generate:
    def __init__(self, **kwargs):
        self.engine = kwargs.get('engine', None)
        self.username = kwargs.get('username', None)
        self.password = kwargs.get('password', None)
        self.host = kwargs.get('host', None)
        self.port = kwargs.get('port', None)
        self.database = kwargs.get('database', '')
        self.parameters = kwargs.get('parameters', '')
        
        try:
            assert self.engine is not None
            assert self.username is not None
            assert self.password is not None
            assert self.host is not None
            assert self.port is not None
            pass
        except AssertionError as err:
            Response({'detail':err}, status=status.HTTP_403_FORBIDDEN)
        
    def url(self):
        url = self.base_url()
            
        if self.database != "":
            url += f"/{self.database}"
        if self.parameters != "":
            url += f"/{self.parameters}"
        return url
    
    def base_url(self):
        url = f"{self.engine}://{self.username}:{self.password}@{self.host}:{self.port}"
        return url
    
    
def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR', None)
    ip = x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')
    return ip