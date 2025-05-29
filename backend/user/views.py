from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import UserProfile
from .serializers import UserProfileSerializer
from backend_company.models import OrderClining
from backend_company.serializers import OrderCliningSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employee_orders(request):
    profile = getattr(request.user, 'profile', None)

    if not profile or profile.status != 'employee':
        return Response({'error': 'Доступ запрещен'}, status=403)

    orders = OrderClining.objects.filter(
        employee=profile,
        order_status__in=['confirmed', 'completed']
    ).select_related('client', 'address', 'service')

    serializer = OrderCliningSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    user = request.user
    profile, _ = UserProfile.objects.get_or_create(user=user)

    if request.method == 'GET':
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    if request.method == 'PUT':
        serializer = UserProfileSerializer(
            profile,
            data=request.data,
            partial=True,
            context={"request": request} 
        )
        if serializer.is_valid():
            serializer.save()
            _update_avatar(request, user)
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


def _update_avatar(request, user):
    avatar = request.data.get('avatar')
    if avatar:
        user.avatar = avatar
        user.save()

        if user.role == 'employee':
            employee = user.company_employee
            if employee:
                employee.avatar = avatar
                employee.save()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employee_profile_view(request):
    user = request.user
    profile = getattr(user, 'profile', None)

    if not profile or profile.status != 'employee':
        return Response({'error': 'Вы не сотрудник'}, status=403)

    serializer = UserProfileSerializer(profile)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_employee_profile(request):
    profile = request.user.profile
    if profile.status != 'employee':
        return Response({'error': 'Нет доступа'}, status=403)

    serializer = UserProfileSerializer(profile, data=request.data, partial=True, context={"request": request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)
