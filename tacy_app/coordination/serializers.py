from django.contrib.auth import get_user_model
from projects.serializers import UserBaseSerializer
from rest_framework import serializers

from .models import CoordinationInitiativeHistory, StagesCoordinationInitiative
from components.models import Initiatives
from projects.models import Project
from components.models import Initiatives


class CoordinationInitiativeSerializer(serializers.ModelSerializer):
    coordinator = UserBaseSerializer()
    author_text = UserBaseSerializer()

    class Meta:
        depth = 1
        model = CoordinationInitiativeHistory
        fields = "__all__"


class CoordinationHistorySerializer(serializers.Serializer):
    history_coordination = CoordinationInitiativeSerializer(many=True)


class SentForApprovalSerializer(serializers.Serializer):
    initiative = serializers.IntegerField()
    text = serializers.CharField()
    coordinator = serializers.IntegerField()

    def validate_coordinator(self, coordinator):
        user = self.context.get("user")
        if user.id == coordinator:
            raise serializers.ValidationError(
                {
                    "coordinator": "coordinator error",
                    "msg": "Автор инициативы не может согласовывать ее",
                }
            )
        return super().validate(coordinator)

    def validate(self, attrs):
        initiative_obj: Initiatives = Initiatives.get_by_id(
            attrs["initiative"]
        )
        project: Project = initiative_obj.project
        community_user_info = project.community_info.filter(
            user_id=attrs.get("coordinator")
        ).first()
        if not community_user_info:
            raise serializers.ValidationError(
                {
                    "coordinator": "coordinator error",
                    "msg": "Такого пользователя нет в сообществе проекта",
                }
            )

        rights_user: GlobalRightsUserInProject = (
            community_user_info.rights_user.all()
        )
        if not any(x.flags.is_coordinate for x in rights_user):
            raise serializers.ValidationError(
                {
                    "coordinator": "coordinator error",
                    "msg": "Не имеет прав 'согласовывать'",
                }
            )
        return super().validate(attrs)

    def validate_initiative(self, initiative):
        user = self.context.get("user")
        initiative_obj = Initiatives.get_by_id(initiative)
        if not initiative_obj:
            raise serializers.ValidationError(
                {
                    "initiative": "id not exist",
                    "msg": "Инициативы с таким id нету",
                }
            )
        if initiative_obj.author != user:
            raise serializers.ValidationError(
                {
                    "initiative": "initiative.author != user",
                    "msg": "Только автор инициативы может отправить на согласование",
                }
            )
        if initiative_obj.failure:
            raise serializers.ValidationError(
                {
                    "initiative failure": "initiative.failure == True",
                    "msg": "Инициатива отозвана",
                }
            )
        return super().validate(initiative)


class AddCommentSerializer(serializers.Serializer):
    initiative = serializers.IntegerField()
    text = serializers.CharField()

    def validate_initiative(self, initiative):
        initiative_obj = Initiatives.get_by_id(initiative)
        if not initiative_obj:
            raise serializers.ValidationError(
                {
                    "initiative": "id not exist",
                    "msg": "Инициативы с таким id нету",
                }
            )
        if initiative_obj.failure:
            raise serializers.ValidationError(
                {
                    "initiative failure": "initiative.failure == True",
                    "msg": "Инициатива отозвана",
                }
            )
        return super().validate(initiative)

    def validate(self, attrs):
        if not CoordinationInitiativeHistory.check_person_add_comment(
            initiative_id=attrs.get("initiative"),
            user=self.context.get("user"),
        ):
            raise serializers.ValidationError(
                {
                    "token (header)": "not enough rights",
                    "msg": "Оставлять комментарии может или автор или люди которые согласют эту инициативу",
                }
            )
        return super().validate(attrs)


class ApprovalSerializer(AddCommentSerializer):
    def validate(self, attrs):
        if not StagesCoordinationInitiative.check_person_approval(
            initiative_id=attrs.get("initiative"),
            user=self.context.get("user"),
        ):
            raise serializers.ValidationError(
                {
                    "token (header)": "not enough rights",
                    "msg": "Согласовывать инициативу могут те, у кого есть такие права",
                }
            )
        return super().validate(attrs)


class SwitchSerializer(serializers.Serializer):
    initiative = serializers.IntegerField()
    failure = serializers.BooleanField()

    def validate_initiative(self, initiative):
        user = self.context.get("user")
        initiative_obj = Initiatives.get_by_id(initiative)
        if not initiative_obj:
            raise serializers.ValidationError(
                {
                    "initiative": "id not exist",
                    "msg": "Инициативы с таким id нету",
                }
            )
        if initiative_obj.author != user:
            raise serializers.ValidationError(
                {
                    "initiative": "initiative.author != user",
                    "msg": "Только автор инициативы может отправить на согласование",
                }
            )
        return super().validate(initiative)
