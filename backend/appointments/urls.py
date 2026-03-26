from django.urls import path
from .views import (
    CreateAppointmentView,
    MyAppointmentsView,
    CounsellorAppointmentsView,
    UpdateAppointmentStatusView,
)

urlpatterns = [
    path("create/", CreateAppointmentView.as_view(), name="create-appointment"),
    path("my/", MyAppointmentsView.as_view(), name="my-appointments"),
    path("counsellor/", CounsellorAppointmentsView.as_view(), name="counsellor-appointments"),
    path("<int:pk>/", UpdateAppointmentStatusView.as_view(), name="update-appointment"),
]
