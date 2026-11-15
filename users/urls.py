
from django.urls import path
from .views import UserRegistrationView, UserLoginView, UserRefreshTokenView, UserProfileView, AdminTestView

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
    ),

    path(
        "profile/",
        UserProfileView.as_view(), name="user-profile"
    ),

    path(
        "admin-test/",
        AdminTestView.as_view(), name="admin-test"
    )
]
