from django.contrib import admin
from .models import Room, Message, Report, Notification

admin.site.register(Room)
admin.site.register(Message)
admin.site.register(Report)
admin.site.register(Notification)