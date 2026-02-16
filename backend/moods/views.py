from django.shortcuts import render
from rest_framework import generics
from .models import MoodEntry
from .serializers import MoodEntrySerializer

class MoodEntryListCreateView(generics.ListCreateAPIView):
    queryset = MoodEntry.objects.all().order_by("-created_at")
    serializer_class = MoodEntrySerializer
