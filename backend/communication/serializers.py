from rest_framework import serializers
from .models import Room, Message, Report, Notification


class RoomSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Room
        fields = "__all__"
        read_only_fields = ["created_by", "participants", "created_at"]


class MessageSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Message
        fields = "__all__"
        read_only_fields = ["user", "created_at"]


class ReportSerializer(serializers.ModelSerializer):
    reported_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Report
        fields = "__all__"
        read_only_fields = ["reported_by", "status", "created_at"]


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"
