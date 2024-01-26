import random
from rest_framework import serializers
from account.models import User

class RegistrationSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(style={ "input_type":"password"}, write_only=True)

    class Meta:
        model = User
        fields = ["email", "first_name", "last_name", "is_developer", "organization", "password", "password2"]
        extra_kwargs = {
            "password" : {"write_only": True}
        }

    def save(self):
        email = self.validated_data["email"]
        first_name = self.validated_data["first_name"]
        last_name = self.validated_data["last_name"]
        is_developer = self.validated_data["is_developer"]
        organization = self.validated_data["organization"]
        #generate username from the user first and last name and attach a random integer to the username
        username = f"{first_name}-{last_name}-{random.randint(5643, 55573)}"
        ip_address = self.validated_data["ip_address"]
        password1 = self.validated_data["password"]
        password2 = self.validated_data["password2"]
    
        if User.objects.filter(email=email).exists(): #if the email already exist in database
            raise serializers.ValidationError({"error": "email in use, please check your mail to verify account"}) #raise validation errow
        
        if User.objects.filter(organization=organization).exists(): #if the email already exist in database
            raise serializers.ValidationError({"error": "This organization exists"}) #raise validation errow
        
        if password1 != password2: #check if password correlate
            raise serializers.ValidationError({"error": "Password and confirm Password does not match"})
    
        user = User(#if every condition is passed, create the User instance
            username=username, 
            email=email,
            first_name=first_name, 
            last_name=last_name, 
            is_developer=is_developer,
            organization=organization,
            ip_address = ip_address,
            password=password1
        ) 
        user.save()
        return user
    
    
class PasswordResetSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True)
    
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only = True)
    new_password = serializers.CharField(write_only = True)

class DeleteAccountSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)