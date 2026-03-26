from rest_framework import serializers
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

        # Check if slot already booked
        if Appointment.objects.filter(
                counsellor=counsellor,
                scheduled_time=scheduled_time,
                status__in=["pending", "approved"]  # ignore cancelled
        ).exists():
            raise serializers.ValidationError(
                "This time slot is already booked"
            )

        return data


class AppointmentStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['status']