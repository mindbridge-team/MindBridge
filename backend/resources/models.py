from django.db import models
from django.contrib.auth.models import User


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Resource(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    link = models.URLField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    categories = models.ManyToManyField(Category, related_name="resources")

    def __str__(self):
        return self.title
