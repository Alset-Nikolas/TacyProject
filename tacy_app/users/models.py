import typing

from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.core import validators
from django.core.validators import RegexValidator
from django.db import models


class UserManager(BaseUserManager):
    def _create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(
                "Данный адрес электронной почты должен быть установлен"
            )

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_user(self, email, password=None, **extra_fields):
        """
        Создает и возвращает `User` с адресом электронной почты,
        именем пользователя и паролем.
        """
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)

        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        """
        Создает и возвращает пользователя с правами
        суперпользователя (администратора).
        """
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Суперпользователь должен иметь is_staff=True.")

        if extra_fields.get("is_superuser") is not True:
            raise ValueError(
                "Суперпользователь должен иметь is_superuser=True."
            )

        return self._create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(
        validators=[validators.validate_email],
        verbose_name="email",
        max_length=100,
        unique=True,
        blank=True,
        null=True,
        default=None,
    )
    first_name = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )
    last_name = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )
    second_name = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )
    phone = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )
    job_title = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )
    project_active = models.ForeignKey(
        "projects.Project",
        on_delete=models.SET_NULL,
        related_name="user_active",
        null=True,
        default=None,
    )
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    USERNAME_FIELD = "email"
    # REQUIRED_FIELDS = ("email",)
    objects = UserManager()

    class Meta:
        db_table = "users"

    def __str__(self):
        return str(self.email)

    def get_full_name(self):
        """
        Этот метод требуется Django для таких вещей,
        как обработка электронной почты.
        Обычно это имя и фамилия пользователя.
        Поскольку мы не храним настоящее имя пользователя,
        мы возвращаем его имя пользователя.
        """
        # return f"{self.last_name} {self.first_name} {self.second_name}"
        return f"{self.pk}"

    def get_short_name(self):
        """
        Этот метод требуется Django для таких вещей,
        как обработка электронной почты.
        Как правило, это будет имя пользователя.
        Поскольку мы не храним настоящее имя пользователя,
        мы возвращаем его имя пользователя.
        """
        # return f"{self.last_name} {self.first_name[0]}.{self.second_name[0]}"
        return f"{self.pk}"

    @classmethod
    def get_user_by_email(cls, email):
        return cls.objects.filter(email=email).first()

    @classmethod
    def get_user_by_id(cls, id):
        return cls.objects.filter(id=id).first()

    @classmethod
    def create_or_update_user(cls, project, user_info):
        user: typing.Optional[User] = cls.get_user_by_email(user_info["email"])
        if user:
            user.first_name = user_info["first_name"]
            user.last_name = user_info["last_name"]
            user.second_name = user_info["second_name"]
            user.email = user_info["email"]
            user.phone = user_info["phone"]
        else:
            user = User.objects.create(
                first_name=user_info["first_name"],
                last_name=user_info["last_name"],
                second_name=user_info["second_name"],
                email=user_info["email"],
                phone=user_info["phone"],
            )
            user.set_password("!")
        user.project_active = project
        user.save()
        return user


from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)
