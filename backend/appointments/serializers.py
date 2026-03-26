from datetime import timedelta
from rest_framework import serializers
from django.utils import timezone
from .models import Appointment
from accounts.models import Counsellor


class AppointmentSerializer(serializers.ModelSerializer):

    patient = serializers.StringRelatedField(read_only=True)
    #counsellor = serializers.StringRelatedField(read_only=True)
    counsellor = serializers.PrimaryKeyRelatedField(
        queryset=Counsellor.objects.all())

    class Meta:
        model = Appointment
        fields = "__all__"
        read_only_fields = ["patient", "status", "created_at"]

    def validate(self, data):
        counsellor = data.get('counsellor')
        scheduled_time = data.get('scheduled_time')
        if not counsellor or not scheduled_time:
            return data

        slot_start = scheduled_time.replace(minute=0, second=0, microsecond=0)
        slot_end = slot_start + timedelta(hours=1)

        # Block any overlap with an existing non-cancelled booking in that hour.
        if Appointment.objects.filter(
                counsellor=counsellor,
                scheduled_time__gte=slot_start,
                scheduled_time__lt=slot_end,
        ).exclude(status="cancelled").exists():
            raise serializers.ValidationError(
                "This time slot is already booked"
            )

        return data


class AppointmentStatusSerializer(serializers.ModelSerializer):
    """
    Used by counsellors to update only the status, but we return the full
    appointment payload so clients can update UI without refetching.
    """

    patient = serializers.StringRelatedField(read_only=True)
    counsellor = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Appointment
        fields = "__all__"
        read_only_fields = ["id", "patient", "counsellor", "scheduled_time", "created_at"]