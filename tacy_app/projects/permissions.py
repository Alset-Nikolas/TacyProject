from rest_framework import permissions


class IsAuthorPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user or request.user.is_staff


class IsAdminOrReadOnlyPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        print("dddddddddddddddd")
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        print(
            "has_object_permission", request.method in permissions.SAFE_METHODS
        )
        if request.method in permissions.SAFE_METHODS:
            return True
        print("has_object_permission", request.user.is_staff)
        return request.user.is_staff
