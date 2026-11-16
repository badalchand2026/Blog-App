from rest_framework.test import APITestCase
from rest_framework import status

from users.models import User


class AuthenticationAPITests(APITestCase):

    def setUp(self):
        self.admin = User.objects.create_superuser(
            email="admin@test.com",
            full_name="Test Admin",
            password="AdminPassword123!",
        )

        self.normal_user = User.objects.create_user(
            email="user@test.com",
            full_name="Test User",
            password="UserPassword123!",
            role="USER",
        )

        self.register_url = "/api/auth/register/"
        self.login_url = "/api/auth/login/"
        self.profile_url = "/api/auth/profile/"
        self.admin_url = "/api/auth/admin-test/"

    def test_user_registration(self):
        response = self.client.post(
            self.register_url,
            {
                "full_name": "New User",
                "email": "newuser@test.com",
                "password": "NewUserPassword123!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["role"], "USER")

    def test_user_login(self):
        response = self.client.post(
            self.login_url,
            {
                "email": "user@test.com",
                "password": "UserPassword123!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_invalid_login(self):
        response = self.client.post(
            self.login_url,
            {
                "email": "user@test.com",
                "password": "WrongPassword123!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_user_can_access_profile(self):
        self.client.force_authenticate(user=self.normal_user)

        response = self.client.get(self.profile_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["role"], "USER")

    def test_anonymous_user_cannot_access_profile(self):
        response = self.client.get(self.profile_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_admin_can_access_admin_endpoint(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(self.admin_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_normal_user_cannot_access_admin_endpoint(self):
        self.client.force_authenticate(user=self.normal_user)

        response = self.client.get(self.admin_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)