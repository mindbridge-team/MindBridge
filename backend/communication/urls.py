from django.urls import path
from .views import *

urlpatterns = [
    path("rooms/create/", CreateRoomView.as_view(), name="create_room"),
    path("rooms/", RoomListView.as_view()),

    path("rooms/<int:pk>/join/", JoinRoomView.as_view()),
    path("rooms/<int:pk>/leave/", LeaveRoomView.as_view()),
    path("rooms/<int:pk>/messages/", RoomMessagesView.as_view()),

    path("messages/send/", SendMessageView.as_view()),
    path("messages/report/", ReportMessageView.as_view()),
    path("notifications/", MyNotificationsView.as_view()),
]
