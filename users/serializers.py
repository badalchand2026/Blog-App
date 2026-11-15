
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password

from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )

    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "email",
            "password",
            "role",
        ]
        read_only_fields = ["id", "role"]

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            full_name=validated_data["full_name"],
            password=validated_data["password"],
            role=User.Role.USER,
        )
        return user



from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class UserLoginSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):

        data = super().validate(attrs)

        data["user"] = {
            "id": self.user.id,
            "full_name": self.user.full_name,
            "email": self.user.email,
            "role": self.user.role,
        }

        return data
