from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework import routers

router = routers.SimpleRouter()


urlpatterns = [
    path("", include(router.urls)),
    path("api/auth/", include("users.urls", namespace="users")),
    path("api/project/", include("projects.urls", namespace="projects")),
    path(
        "api/notifications/",
        include("notifications.urls", namespace="notifications"),
    ),
    path(
        "api/components/",
        include("components.urls", namespace="components"),
    ),
    path(
        "api/coordination/",
        include("coordination.urls", namespace="coordination"),
    ),
    path(
        "api/grafics/",
        include("grafics.urls", namespace="grafics"),
    ),
    path("admin/", admin.site.urls),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
