from rest_framework import generics, permissions
from .models import MoodEntry
from .serializers import MoodEntrySerializer

class MoodEntryListCreateView(generics.ListCreateAPIView):
    serializer_class = MoodEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MoodEntry.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)