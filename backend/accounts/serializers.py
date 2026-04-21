from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Counsellor


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )


class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    def get_role(self, obj):
        profile = getattr(obj, "profile", None)
        if profile and getattr(profile, "role", None):
            return profile.role
        # Keep API stable even if legacy users are missing profile rows.
        return "patient"

    class Meta:
        model = User
        fields = ["id", "username", "email", "role"]


class CounsellorSerializer(serializers.ModelSerializer):

    username = serializers.CharField(source="user.username")
    email = serializers.CharField(source="user.email")

    class Meta:
        model = Counsellor
        fields = [
            "id",
            "username",
            "email",
            "specialization",
            "experience_years",
            "availability_text",
            "is_verified",
        ]
