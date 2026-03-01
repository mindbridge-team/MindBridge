from django.db import models
from django.conf import settings

class MoodEntry(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="mood_entries")
    mood_value = models.IntegerField()  # 1-5
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - Mood {self.mood_value} at {self.created_at}"