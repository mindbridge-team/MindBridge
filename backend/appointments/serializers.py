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


