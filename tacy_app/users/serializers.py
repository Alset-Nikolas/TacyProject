from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers
from projects.models import СommunityProject, RightsUSerInProject
from projects.serializers import UserBaseSerializer

User = get_user_model()


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(
        label="email",
        write_only=True,
        help_text="Почта пользователя для авторизации",
    )
    password = serializers.CharField(
        label="Password",
        style={"input_type": "password"},
        trim_whitespace=False,
        write_only=True,
        help_text="Пароль пользователя",
    )

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")
        user = authenticate(
            request=self.context.get("request"),
            email=email,
            password=password,
        )
        if not user:
            msg = "Неправильный адрес электронной почты или пароль."
            raise serializers.ValidationError(
                {"email or password": msg}, code="authorization"
            )

        attrs["user"] = user
        return attrs


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "second_name",
            "phone",
            "is_superuser",
        ]


class RightUserSerializer(serializers.ModelSerializer):
    class Meta:
        depth = 1
        model = RightsUSerInProject
        fields = [
            "id",
            "name",
            "flags",
        ]


class СommunityProjectSerializer(serializers.ModelSerializer):
    rights_user = RightUserSerializer(many=True)
    user = UserBaseSerializer()

    class Meta:
        depth = 1
        model = СommunityProject
        fields = [
            "id",
            "rights_user",
            "user",
            "role_user",
        ]
