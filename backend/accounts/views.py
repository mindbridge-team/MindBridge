from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import RegisterSerializer, UserSerializer
from .models import Counsellor
from .serializers import CounsellorSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class CounsellorListView(generics.ListAPIView):
    queryset = Counsellor.objects.filter(is_verified=True)
    serializer_class = CounsellorSerializer
    permission_classes = [permissions.IsAuthenticated]
