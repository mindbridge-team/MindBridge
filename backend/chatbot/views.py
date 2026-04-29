from django.shortcuts import render
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
import requests


@api_view(["POST"])
@permission_classes([AllowAny])
def chatbot_message(request):
    message = request.data.get("message")
    sender = request.data.get("sender", "anonymous_user")
    role = request.data.get("role", "patient")

    if role not in ["patient", "counselor"]:
        role = "patient"

    if not message:
        return Response(
            {"error": "Message is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    rasa_url = f"{settings.RASA_URL}/webhooks/rest/webhook"

    payload = {
        "sender": sender,
        "message": message,
        "metadata": {
            "role": role
        }
    }

    try:
        rasa_response = requests.post(rasa_url, json=payload, timeout=30)
        rasa_response.raise_for_status()
        rasa_data = rasa_response.json()

        messages = []
        for item in rasa_data:
            if "text" in item:
                messages.append(item["text"])

        return Response(
            {
                "success": True,
                "sender": sender,
                "role": role,
                "messages": messages,
                "raw": rasa_data
            },
            status=status.HTTP_200_OK
        )

    except requests.exceptions.RequestException as e:
        return Response(
            {
                "success": False,
                "error": "Failed to connect to Rasa.",
                "details": str(e)
            },
            status=status.HTTP_502_BAD_GATEWAY
        )