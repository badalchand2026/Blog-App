
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
)
from .permissions import IsAdminRole

class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    throttle_scope = "register"


class UserLoginView(TokenObtainPairView):
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]
    throttle_scope = "login"


class UserRefreshTokenView(TokenRefreshView):
    permission_classes = [AllowAny]


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        return Response({
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
        })



class AdminTestView(APIView):

    permission_classes = [IsAdminRole]

    def get(self, request):

        return Response({
            "success": True,
            "message": "Welcome Admin! You have access to this protected API.",
            "user": {
                "id": request.user.id,
                "email": request.user.email,
                "role": request.user.role,
            }
        })