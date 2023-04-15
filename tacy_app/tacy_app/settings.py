import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = (
    "django-insecure-kaqkqa27i$9yn560@(_fxi0#(d4=i70mlg#w)a5ekfj-dswmyy"
)
IP_SERVER = "31.177.78.111"
# IP_SERVER = "localhost"
ALLOWED_HOSTS = [IP_SERVER, "127.0.0.1", "localhost", "0.0.0.0"]
DEBUG = False

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "origin",
    "dnt",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]
CORS_ALLOW_METHODS = ["DELETE", "GET", "OPTIONS", "PATCH", "POST", "PUT"]
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8080",
    "http://localhost",
    f"http://{IP_SERVER}",
    f"http://{IP_SERVER}:3000",
    f"http://{IP_SERVER}:8080",
]
CORS_ORIGIN_WHITELIST = ("localhost:8080",)
CORS_ORIGIN_ALLOW_ALL = True

AUTH_USER_MODEL = "users.User"


INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework.authtoken",
    "django_rest_passwordreset",
    "django_cleanup.apps.CleanupConfig",
    "drf_yasg",
    "corsheaders",
    "users",
    "projects",
    "notifications",
    "components",
    "coordination",
    "grafics",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "django.middleware.common.CommonMiddleware",
]

ROOT_URLCONF = "tacy_app.urls"

TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")


TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [TEMPLATES_DIR],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "tacy_app.wsgi.application"


DATABASES = {
    # "default": {
    #     "ENGINE": "django.db.backends.sqlite3",
    #     "NAME": BASE_DIR / "db.sqlite3",
    # }
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "tacy_project_db",
        # "NAME": "teisy",
        "USER": "postgres",
        "PASSWORD": "qwerty",
        "HOST": "tacy_backend_postgres_container",
        # "HOST": "localhost",
        "PORT": "5432",
    }
}


SWAGGER_SETTINGS = {
    "api_path": "/docs",
    "SECURITY_DEFINITIONS": {
        "Bearer": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": "Формат: Token *****",
        }
    },
    "DEFAULT_MODEL_RENDERING": "example",
}

AUTH_PASSWORD_VALIDATORS = [
    # {
    #     "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    # },
    # {
    #     "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    # },
    # {
    #     "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    # },
    # {
    #     "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    # },
]

LANGUAGE_CODE = "ru"

TIME_ZONE = "UTC"

USE_I18N = True

USE_L10N = True

USE_TZ = True

STATIC_URL = "/back_static/"
STATIC_ROOT = os.path.join(BASE_DIR, "back_staticfiles")
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


USE_L10N = False
DATE_INPUT_FORMATS = ("%d.%m.%Y", "%Y-%m-%d")
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework.authentication.TokenAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 5,
    "DATE_INPUT_FORMATS": DATE_INPUT_FORMATS,
    "DATETIME_FORMAT": "%Y-%m-%dT%H:%M:%S.%fZ",
}

MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "mediafiles")


EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"

######ТУТ
EMAIL_HOST_USER = "hvatovnikolaj804@gmail.com"
EMAIL_HOST_PASSWORD = ""

EMAIL_PORT = 587
EMAIL_USE_TLS = True

SITE_DOMAIN = f"http://{IP_SERVER}"

SITE_FULL_NAME = "Site name"
