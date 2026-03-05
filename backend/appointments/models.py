from django.db import models
from django.contrib.auth.models import User
from accounts.models import Counsellor


class Appointment(models.Model):

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    patient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="patient_appointments"
    )

    counsellor = models.ForeignKey(
        Counsellor,
        on_delete=models.CASCADE,
        related_name="counsellor_appointments"
    )

    scheduled_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient.username} - {self.counsellor.user.username}"