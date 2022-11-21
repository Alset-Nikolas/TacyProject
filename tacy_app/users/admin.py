from django.contrib import admin

from .models import User


class UserAdmin(admin.ModelAdmin):
    list_display = (
        "first_name",
        "last_name",
        "second_name",
        "email",
        "phone",
        "job_title",
    )


admin.site.register(User, UserAdmin)
