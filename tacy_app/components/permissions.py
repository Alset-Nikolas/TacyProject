from rest_framework import permissions
from .models import Initiatives
from projects.models import Project


class IsUserCreatorInitiativesOrAdminPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        rights_project = Project.get_user_rights_flag_in_project(
            request.user, obj
        )
        return rights_project.get("is_create", False)


class IsUserUpdateInitiativesOrAdminPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        rights_user_in_initiative: dict = Initiatives.get_user_rigts(
            request.user, initiative=obj
        )
        return rights_user_in_initiative.get("is_update", False)


class IsUserAuthorInitiativesOrAdminPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user or request.user.is_staff


class IsAdminOrReadOnlyPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_staff
