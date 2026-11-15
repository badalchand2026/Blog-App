from django.contrib import admin
from .models import Blog


@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "author",
        "is_published",
        "created_at",
    )

    list_filter = ("is_published", "created_at")

    search_fields = ("title", "content")

    prepopulated_fields = {
        "slug": ("title",)
    }

    ordering = ("-created_at",)