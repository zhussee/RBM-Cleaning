from django.shortcuts import render, redirect
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import ServiceSerializer
from .forms import ServiceForm
from django.contrib.auth.decorators import login_required
from backend_company.models import AdditionalService
from backend_company.serializers import AdditionalServiceSerializer
from backend_company.models import Service
from backend_company.serializers import ServiceSerializer


@login_required
def add_service(request):
    if request.method == 'POST':
        form = ServiceForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('service_list')  # перенаправим на список услуг
    else:
        form = ServiceForm()
    return render(request, 'add_service.html', {'form': form})


@login_required
def service_list(request):
    services = Service.objects.all()
    return render(request, 'AddService/service_list.html', {'services': services})


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def service_list_create(request):
    if request.method == 'GET':
        services = Service.objects.all()
        serializer = ServiceSerializer(services, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        profile = getattr(request.user, 'profile', None)
        if not profile or profile.status != 'company':
            return Response({"error": "Только компания может добавлять услуги"}, status=403)

        serializer = ServiceSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            # 🔧 вручную добавляем компанию из профиля пользователя
            serializer.save(company=profile.company)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def additional_service_list(request):
    if request.method == 'GET':
        extras = AdditionalService.objects.all()
        serializer = AdditionalServiceSerializer(extras, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        profile = getattr(request.user, 'profile', None)
        if not profile or profile.status != 'company':
            return Response({'error': 'Только компания может добавлять доп. услуги'}, status=403)

        serializer = AdditionalServiceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(company=profile.company) 
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

