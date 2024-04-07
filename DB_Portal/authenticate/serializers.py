import random
from rest_framework import serializers
from .models import User, Profile

class RegistrationSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(style={ "input_type":"password"}, write_only=True)

    class Meta:
        model = User
        fields = ["email", "first_name", "last_name", "gender", "is_developer", "organization", "password", "password2", "accept_term"]
        extra_kwargs = {
            "password" : {"write_only": True}
        }

    def save(self):
        email = self.validated_data["email"].lower()
        first_name = self.validated_data["first_name"].lower()
        last_name = self.validated_data["last_name"].lower()
        gender = self.validated_data["gender"]
        is_developer = self.validated_data["is_developer"]
        organization = self.validated_data["organization"]
        #generate username from the user first and last name and attach a random integer to the username
        username = f"{first_name}-{last_name}-{random.randint(5643, 55573)}"
        ip_address = self.validated_data["ip_address"]
        password1 = self.validated_data["password"]
        password2 = self.validated_data["password2"]
        accept_term = self.validated_data["accept_term"]
    
        try:
            assert User.objects.filter(email=email).exists() == False, "email in use, please check your mail to verify account"
            
            if organization != "":
                assert User.objects.filter(organization=organization).exists() == False, "This organization exists"
            
            assert password1 == password2, "Password and confirm Password does not match"
            
            assert accept_term == True, "Please accept terms and condition"
            
            #if every condition is passed, create the User instance
            user = User(
                username=username, 
                email=email,
                first_name=first_name, 
                last_name=last_name, 
                gender=gender,
                is_developer=is_developer,
                organization=organization,
                ip_address = ip_address,
                accept_term = accept_term
            ) 
            user.set_password(password1)
            user.save()
            return user
            
        except AssertionError as err:
            raise serializers.ValidationError({"detail": str(err)})
        
    
    
class PasswordResetSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True)
    
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only = True)
    new_password = serializers.CharField(write_only = True)

class DeleteAccountSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
class ProfileDataSerializer(serializers.ModelSerializer):
    email = serializers.CharField(source='user.email', read_only = True)
    first_name = serializers.CharField(source='user.first_name', read_only = True)
    last_name = serializers.CharField(source='user.last_name', read_only = True)
    username = serializers.CharField(source='user.last_name', read_only = True)
    avatar = serializers.CharField(source='user.avatar', read_only = True)
    gender = serializers.CharField(source='user.gender', read_only = True)
    organization = serializers.CharField(source='user.organization', read_only = True)
    is_developer = serializers.CharField(source='user.is_developer', read_only = True)
    class Meta:
        model = Profile
        fields = [
            "email", "first_name", "last_name", "username", "avatar", "gender", "organization", "is_developer", 
            'bio', 'phone', 'website', 'linkedIn', 'github', 'twitter', 'stackoverflow', 'skills','country', 
            'city', 'postal_code'
        ]

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["email", "first_name", "last_name", "username", "gender", "organization", "is_developer"]
        
    def save(self, *args, **kwargs):
        self.validated_data.pop('email')
        self.validated_data.pop('username')
        
        return super(UserSerializer, self).save(*args, **kwargs)

class SearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['user_id', 'username']
        
class AvatarSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['avatar',]