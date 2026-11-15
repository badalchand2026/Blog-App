
from django.urls import path
from .views import UserRegistrationView, UserLoginView, UserRefreshTokenView

urlpatterns = [
    path(
        "register/",
        UserRegistrationView.as_view(),
        name="user-register"
    ),

    path(
        "login/",
        UserLoginView.as_view(),
        name="user-login"
    ),

    path(
        "refresh/",
        UserRefreshTokenView.as_view(),
        name="user-refresh"
    )
]
