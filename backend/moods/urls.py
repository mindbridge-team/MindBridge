from django.urls import path
from .views import MoodEntryListCreateView

urlpatterns = [
    path("moods/", MoodEntryListCreateView.as_view(), name="mood-list-create"),
]
