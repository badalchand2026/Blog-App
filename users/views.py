
from rest_framework import generics
from rest_framework.permissions import AllowAny

from .serializers import UserRegistrationSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import UserLoginSerializer

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)




class UserRegistrationView(generics.CreateAPIView):

    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]



class UserLoginView(TokenObtainPairView):

    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]


class UserRefreshTokenView(TokenRefreshView):
    permission_classes = [AllowAny]