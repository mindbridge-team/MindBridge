from rest_framework import generics, permissions
from .models import Appointment
from .serializers import AppointmentSerializer, AppointmentStatusSerializer
from .permissions import IsPatient, IsCounsellor
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime, timedelta
from django.utils import timezone


class CreateAppointmentView(generics.CreateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsPatient]

    def perform_create(self, serializer):
        serializer.save(patient=self.request.user)


class MyAppointmentsView(generics.ListAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsPatient]

    def get_queryset(self):
        return Appointment.objects.filter(patient=self.request.user)


class CounsellorAppointmentsView(generics.ListAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsCounsellor]

    def get_queryset(self):
        return Appointment.objects.filter(counsellor__user=self.request.user)


class UpdateAppointmentStatusView(generics.UpdateAPIView):
    # queryset = Appointment.objects.all()
    serializer_class = AppointmentStatusSerializer
    permission_classes = [permissions.IsAuthenticated, IsCounsellor]

    def get_queryset(self):
        return Appointment.objects.filter(counsellor__user=self.request.user)


class AvailableSlotsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, counsellor_id):
        date_str = request.query_params.get('date')  # ?date=2026-03-30
        date = datetime.strptime(date_str, "%Y-%m-%d").date()

        # start_time = datetime.combine(date, datetime.min.time()).replace(hour=9)
        # end_time = datetime.combine(date, datetime.min.time()).replace(hour=17)

        start_time = timezone.make_aware(
            datetime.combine(date, datetime.min.time()).replace(hour=8)
        )
        # Slots are 1 hour long; end_time is exclusive so set to 18:00
        # to include a 17:00 (5pm) start time.
        end_time = timezone.make_aware(
            datetime.combine(date, datetime.min.time()).replace(hour=18)
        )

        slots = []
        current = start_time

        while current < end_time:
            slots.append(current)
            current += timedelta(hours=1)

        # Get booked appointments within the booking window for this day.
        # Using a range check avoids timezone/equality edge-cases.
        booked_appointments = Appointment.objects.filter(
            counsellor_id=counsellor_id,
            scheduled_time__gte=start_time,
            scheduled_time__lt=end_time
        ).exclude(status="cancelled").values_list('scheduled_time', flat=True)

        booked_slot_starts = {
            timezone.localtime(dt).replace(minute=0, second=0, microsecond=0)
            for dt in booked_appointments
        }

        # Remove booked slots (same hour start)
        available_slots = [
            slot for slot in slots
            if slot.replace(minute=0, second=0, microsecond=0) not in booked_slot_starts
        ]

        return Response({
            "available_slots": available_slots
        })
