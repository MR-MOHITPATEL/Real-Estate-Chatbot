from django.contrib import admin

from .models import QueryLog


@admin.register(QueryLog)
class QueryLogAdmin(admin.ModelAdmin):
    list_display = ("query", "created_at")
    search_fields = ("query",)
    readonly_fields = ("query", "created_at")

from django.contrib import admin

# Register your models here.
