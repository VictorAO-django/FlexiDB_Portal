from rest_framework.permissions import BasePermission
from helper import get_client_ip

class IsVerified(BasePermission):
    message = "User must be verified"

    def has_permission(self, request, view):
        return request.user and request.user.is_verified

class IpIsValid(BasePermission):
    message = "Ip address is not recognized"
    def has_permission(self, request, view):
        ip = get_client_ip(request)
        return ip in request.user.ip_address