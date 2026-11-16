from django.shortcuts import render

# Create your views here.

from rest_framework import generics
from rest_framework.permissions import AllowAny

from .models import Blog
from .serializers import BlogSerializer
from users.permissions import IsAdminRole


class BlogListCreateView(generics.ListCreateAPIView):

    serializer_class = BlogSerializer
    filterset_fields = ["is_published"]
    search_fields = ["title", "content"]



    def get_permissions(self):

        if self.request.method == "POST":
            return [IsAdminRole()]

        return [AllowAny()]

    def get_queryset(self):

        user = self.request.user

        if user.is_authenticated and user.role == "ADMIN":
            return Blog.objects.all()

        return Blog.objects.filter(is_published=True)

    def perform_create(self, serializer):

        serializer.save(author=self.request.user)





class BlogDetailView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = BlogSerializer

    def get_permissions(self):

        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsAdminRole()]

        return [AllowAny()]

    def get_queryset(self):

        user = self.request.user

        if user.is_authenticated and user.role == "ADMIN":
            return Blog.objects.all()

        return Blog.objects.filter(is_published=True)
