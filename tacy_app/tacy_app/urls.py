from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.conf import settings


urlpatterns = [
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
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL, document_root=settings.MEDIA_ROOT
    )
    urlpatterns += static(
        settings.STATIC_URL, document_root=settings.STATIC_ROOT
    )

    schema_view = get_schema_view(
        openapi.Info(
            title="TacyProject API",
            default_version="v1",
            description="Документация для приложения tacy проекта TacyProject",
            # terms_of_service="URL страницы с пользовательским соглашением",
            contact=openapi.Contact(email="Alset.Nikolas@yandex.ru"),
        ),
        public=True,
        permission_classes=(permissions.AllowAny,),
    )

    urlpatterns += [
        re_path(
            r"^swagger(?P<format>\.json|\.yaml)$",
            schema_view.without_ui(cache_timeout=0),
            name="schema-json",
        ),
        re_path(
            r"^swagger/$",
            schema_view.with_ui("swagger", cache_timeout=0),
            name="schema-swagger-ui",
        ),
        re_path(
            r"^redoc/$",
            schema_view.with_ui("redoc", cache_timeout=0),
            name="schema-redoc",
        ),
    ]
