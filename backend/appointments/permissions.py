from rest_framework.permissions import BasePermission


class IsPatient(BasePermission):
    def has_permission(self, request, view):
        return request.user.profile.role == "patient"


class IsCounsellor(BasePermission):
    def has_permission(self, request, view):
        return request.user.profile.role == "counsellor"
