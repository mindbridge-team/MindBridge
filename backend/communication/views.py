from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from .models import Room, Message, Report, Notification
from .serializers import (
    RoomSerializer,
    MessageSerializer,
    ReportSerializer,
    NotificationSerializer
)


class CreateRoomView(generics.CreateAPIView):
    serializer_class = RoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.profile.role != "counsellor":
            raise PermissionDenied("Only counsellors can create rooms")

        room = serializer.save(created_by=self.request.user)
        room.participants.add(self.request.user)


class RoomListView(generics.ListAPIView):
    serializer_class = RoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    queryset = Room.objects.filter(is_active=True)


class JoinRoomView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        room = Room.objects.get(id=pk)
        room.participants.add(request.user)

        return Response({"message": "Joined room"})


class LeaveRoomView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        room = Room.objects.get(id=pk)
        room.participants.remove(request.user)

        return Response({"message": "Left room"})


class SendMessageView(generics.CreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        room = serializer.validated_data["room"]

        if self.request.user not in room.participants.all():
            raise PermissionDenied("Join room first")

        serializer.save(user=self.request.user)


class RoomMessagesView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        room = Room.objects.get(id=self.kwargs["pk"])

        if self.request.user not in room.participants.all():
            raise PermissionDenied("Not allowed")

        return Message.objects.filter(room=room).order_by("created_at")


class ReportMessageView(generics.CreateAPIView):
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user)


class MyNotificationsView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
