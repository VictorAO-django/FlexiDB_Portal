from rest_framework.exceptions import APIException
from rest_framework import status
    
class LoginFailed(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = "login failed"
    
class NewIpAddress(APIException):
    status_code = status.HTTP_417_EXPECTATION_FAILED
    default_detail = "a message has been sent to your mail to allow allow this device to login"
    
class InvalidUser(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = "invalid user"
    
class InvalidDatabase(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = "invalid database"
    
class CannotConnect(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = "connection cannot be establihed"
    
class NoSuchDatabase(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = "you do not have such database registered"
    
class RegisteredByYou(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = "you have registered an exact database with same details"
    
class RegisteredBySomeone(APIException):
    status_code = status.HTTP_302_FOUND
    default_detail = "an organization/devloper have registered this database, kindly request for permission"

class InvalidPermission(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = "this permission type cannot be recognized"

class NotPermitted(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = "You're not permitted to perform this operation"
