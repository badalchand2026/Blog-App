
from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):

    message = "Only ADMIN users can access this resource."

    def has_permission(self, request, view):

        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "ADMIN"
        )
