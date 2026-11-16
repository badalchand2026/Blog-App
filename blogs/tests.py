from rest_framework.test import APITestCase
from rest_framework import status

from users.models import User
from blogs.models import Blog


class BlogAPITests(APITestCase):

    def setUp(self):
        # Create ADMIN user
        self.admin = User.objects.create_user(
            email="admin@test.com",
            full_name="Test Admin",
            password="TestPassword123!",
            role="ADMIN",
        )

        # Create normal USER
        self.normal_user = User.objects.create_user(
            email="user@test.com",
            full_name="Test User",
            password="TestPassword123!",
            role="USER",
        )

        # Create a published blog
        self.published_blog = Blog.objects.create(
            title="Published Blog",
            slug="published-blog",
            content="This blog is visible to everyone.",
            author=self.admin,
            is_published=True,
        )

        # Create a draft blog
        self.draft_blog = Blog.objects.create(
            title="Draft Blog",
            slug="draft-blog",
            content="This blog is not public.",
            author=self.admin,
            is_published=False,
        )

        self.blog_url = "/api/blogs/"

    def test_anonymous_user_sees_only_published_blogs(self):
        response = self.client.get(self.blog_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        blog_ids = [
            blog["id"] for blog in response.data["results"]
        ]

        self.assertIn(self.published_blog.id, blog_ids)
        self.assertNotIn(self.draft_blog.id, blog_ids)

    def test_normal_user_sees_only_published_blogs(self):
        self.client.force_authenticate(user=self.normal_user)

        response = self.client.get(self.blog_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        blog_ids = [
            blog["id"] for blog in response.data["results"]
        ]

        self.assertIn(self.published_blog.id, blog_ids)
        self.assertNotIn(self.draft_blog.id, blog_ids)

    def test_admin_can_see_draft_blogs(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(self.blog_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        blog_ids = [
            blog["id"] for blog in response.data["results"]
        ]

        self.assertIn(self.draft_blog.id, blog_ids)

    def test_normal_user_cannot_create_blog(self):
        self.client.force_authenticate(user=self.normal_user)

        response = self.client.post(
            self.blog_url,
            {
                "title": "Unauthorized Blog",
                "slug": "unauthorized-blog",
                "content": "This should not be created.",
                "is_published": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_create_blog(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            self.blog_url,
            {
                "title": "Automated Test Blog",
                "slug": "automated-test-blog",
                "content": "Created through an automated test.",
                "is_published": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertTrue(
            Blog.objects.filter(
                slug="automated-test-blog"
            ).exists()
        )

    def test_anonymous_user_cannot_read_draft_detail(self):
        response = self.client.get(
            f"{self.blog_url}{self.draft_blog.id}/"
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)