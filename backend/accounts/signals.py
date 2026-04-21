from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Counsellor, Profile


@receiver(post_save, sender=Profile)
def ensure_counsellor_record(sender, instance, **kwargs):
    """Counsellor bookings use the Counsellor model, not only Profile.role.
    When someone is marked as counsellor, ensure a Counsellor row exists."""
    if instance.role != "counsellor":
        return
    Counsellor.objects.get_or_create(
        user=instance.user,
        defaults={
            "specialization": "Counselling",
            "experience_years": 1,
            "availability_text": "Please contact for available times.",
            "is_verified": True,
        },
    )
