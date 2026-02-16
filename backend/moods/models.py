from django.db import models

class MoodEntry(models.Model):
    mood_value = models.IntegerField()  # 1-5
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Mood {self.mood_value} at {self.created_at}"
