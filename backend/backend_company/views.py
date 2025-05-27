from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from user.models import UserProfile
from user.serializers import UserProfileSerializer
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from .payments import create_payment_session
from .models import CleaningCompany, Review, Service, OrderClining, AdditionalService, Address
from .serializers import (
    CleaningCompanySerializer,
    ReviewSerializer,
    ServiceSerializer,
    OrderCliningSerializer,
    AddressCreateSerializer,
    AddressSerializer,
    CompanyAccountCreateSerializer,
    CompanyProfileUpdateSerializer,  
    CompanyOrderSerializer,
    AdditionalServiceSerializer,
)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def company_profile(request):
    try:
        company = CleaningCompany.objects.get(user=request.user)
    except CleaningCompany.DoesNotExist:
        return Response({'error': 'Компания не найдена'}, status=404)

    if request.method == 'GET':
        serializer = CompanyProfileUpdateSerializer(company)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = CompanyProfileUpdateSerializer(company, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_company_account(request):
    serializer = CompanyAccountCreateSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'detail': 'Компания успешно зарегистрирована'}, status=201)
    return Response(serializer.errors, status=400)


@api_view(['GET'])
def company_list(request):
    company = CleaningCompany.objects.all()
    serializer = CleaningCompanySerializer(company, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_employee(request):
    user_profile = getattr(request.user, 'profile', None)

    if not user_profile or user_profile.status != 'company':
        return Response({'error': 'Доступ запрещён. Только компании могут добавлять сотрудников'}, status=403)

    data = request.data
    required_fields = ['first_name', 'last_name', 'email', 'password', 'phone_number']
    for field in required_fields:
        if not data.get(field):
            return Response({'error': f"Поле {field} обязательно"}, status=400)

    if User.objects.filter(username=data['email']).exists():
        return Response({'error': 'Пользователь с такой почтой уже существует'}, status=400)

    # Создание пользователя
    user = User.objects.create_user(
        username=data['email'],
        email=data['email'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        password=data['password'],
    )

    # Убедимся, что UserProfile не создаётся автоматически где-то ещё
    profile, created = UserProfile.objects.get_or_create(user=user)
    profile.status = 'employee'
    profile.phone_number = data['phone_number']
    profile.company = user_profile.company
    profile.is_verified = True
    profile.save()

    return Response({'detail': 'Сотрудник успешно добавлен'}, status=201)


@api_view(['GET'])
def company_detail(request, id):
    company = get_object_or_404(CleaningCompany, pk=id)
    company_data = CleaningCompanySerializer(company).data
    reviews = Review.objects.filter(company=company)
    services = Service.objects.filter(company=company)[:3]

    return Response({
        "company": company_data,
        "services": ServiceSerializer(services, many=True).data,
        "reviews": ReviewSerializer(reviews, many=True).data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_address(request):
    serializer = AddressCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_addresses(request):
    addresses = Address.objects.filter(user=request.user)
    serializer = AddressSerializer(addresses, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_orders(request):
    orders = OrderClining.objects.filter(client=request.user).select_related('service', 'company', 'address')
    serializer = OrderCliningSerializer(orders, many=True)
    return Response(serializer.data)


from .payments import create_payment_session  # убедитесь, что импорт есть

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    data = request.data.copy()
    try:
        address_id = int(data.get('address'))
        service_id = int(data.get('service'))
    except (TypeError, ValueError):
        return Response({"error": "Некорректный ID адреса или услуги"}, status=400)

    try:
        address = request.user.addresses.get(id=address_id)
    except Address.DoesNotExist:
        return Response({"error": "Адрес не найден"}, status=400)

    square_meters = address.square_meters

    try:
        service = Service.objects.get(id=service_id)
    except Service.DoesNotExist:
        return Response({"error": "Услуга не найдена"}, status=400)

    base_price = float(service.price_per_m2) * square_meters

    additional_ids = data.get('additional_services', [])
    if isinstance(additional_ids, str):
        import json
        try:
            additional_ids = json.loads(additional_ids)
        except Exception:
            additional_ids = []

    additional_qs = []
    total_additional = 0
    if isinstance(additional_ids, list) and additional_ids:
        additional_qs = AdditionalService.objects.filter(id__in=additional_ids)
        total_additional = sum(float(a.price) for a in additional_qs)

    total = base_price + total_additional

    # Формируем данные заказа
    employee = None
    employee_id = data.get('employee')
    if employee_id:
        try:
            employee_id = int(employee_id)
            employee = UserProfile.objects.get(id=employee_id, status='employee', company=service.company)
        except (UserProfile.DoesNotExist, ValueError, TypeError) as e:
            print("🔍 Ошибка при поиске employee:", str(e))
            return Response({"error": "Сотрудник не найден или не принадлежит выбранной компании"}, status=400)

    order_data = {
        "address": address_id,
        "service": service_id,
        "company": service.company.id,
        "total_amount": round(total, 2),
        "comment": data.get("comment", ""),
        "payment_type": data.get("payment_type", "cash"),
        "cleaning_date": data.get("cleaning_date"),
        "cleaning_time": data.get("cleaning_time"),
        "employee": employee.id if employee else None,
    }

    serializer = OrderCliningSerializer(data=order_data, context={"request": request})
    if serializer.is_valid():
        order = serializer.save()
        if additional_qs:
            order.additional_services.set(additional_qs)

        if data["payment_type"] == "card":
            access_token = create_payment_session(order)
            if not access_token:
                return Response({"error": "Ошибка при инициализации платежа"}, status=500)

            return Response({
                "payment_required": True,
                "access_token": access_token,
                "order_id": order.id,
                "amount": order.total_amount
            }, status=201)

        return Response(OrderCliningSerializer(order).data, status=status.HTTP_201_CREATED)

    print("❌ Ошибки сериализации заказа:", serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_order(request, order_id):
    try:
        order = OrderClining.objects.get(id=order_id)

        user_profile = getattr(request.user, 'profile', None)
        if order.client != request.user and (not user_profile or user_profile.company != order.company):
            return Response({"error": "У вас нет прав на отмену этого заказа"}, status=403)

        if order.order_status in ['completed', 'canceled']:
            return Response({"error": "Нельзя отменить завершённый или уже отменённый заказ"}, status=400)

        order.order_status = 'canceled'
        order.cancel_reason = request.data.get("reason", "")
        order.save()
        return Response({"detail": "Заказ отменён"}, status=200)
    except OrderClining.DoesNotExist:
        return Response({"error": "Заказ не найден"}, status=404)


@api_view(['POST'])
@permission_classes([])
def payment_callback(request):
    order_id = request.data.get('order_id')
    status = request.data.get('status')

    try:
        order = OrderClining.objects.get(id=order_id)
    except OrderClining.DoesNotExist:
        return Response({"error": "Заказ не найден"}, status=404)

    if status == 'success':
        order.order_status = 'confirmed'
        order.save()
        return Response({"detail": "Оплата подтверждена"})

    return Response({"detail": "Оплата не прошла"}, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_order(request, order_id):
    try:
        order = OrderClining.objects.get(id=order_id)

        user_profile = getattr(request.user, "profile", None)
        if not user_profile or user_profile.status != 'company':
            return Response({"error": "Только представитель компании может подтверждать заказы"}, status=403)

        if user_profile.company != order.company:
            return Response({"error": "Вы не можете подтверждать заказы других компаний"}, status=403)

        if order.order_status != 'new':
            return Response({"error": "Только новые заказы можно подтвердить"}, status=400)

        order.order_status = 'confirmed'
        order.save()
        return Response({"detail": "Заказ подтверждён"}, status=200)
    except OrderClining.DoesNotExist:
        return Response({"error": "Заказ не найден"}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def available_orders_for_employee(request):
    user_profile = getattr(request.user, 'userprofile', None)

    if not user_profile or user_profile.status != 'employee':
        return Response({"error": "Доступ разрешён только сотрудникам"}, status=403)

    orders = OrderClining.objects.filter(
        company=user_profile.company,
        order_status='confirmed',
        employee__isnull=True
    ).select_related('service', 'address', 'company')

    serializer = OrderCliningSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def company_orders(request):
    user_profile = getattr(request.user, 'profile', None)

    if not user_profile or user_profile.status != 'company':
        return Response({"error": "Доступ разрешён только представителям компании"}, status=403)

    orders = OrderClining.objects.filter(company=user_profile.company).select_related('client', 'service', 'address')
    serializer = CompanyOrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employee_orders(request):
    user_profile = getattr(request.user, 'profile', None)
    if not user_profile or user_profile.status != 'employee':
        return Response({'error': 'Только сотрудники могут просматривать заказы'}, status=403)

    orders = OrderClining.objects.filter(
        employee=user_profile,
        order_status__in=['confirmed', 'completed']
    ).select_related('service', 'company', 'address')

    serializer = OrderCliningSerializer(orders, many=True)  
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_order(request, order_id):
    user_profile = getattr(request.user, 'profile', None)

    if not user_profile or user_profile.status != 'employee':
        return Response({"error": "Только сотрудник может завершить заказ"}, status=403)

    try:
        order = OrderClining.objects.get(id=order_id, employee=user_profile)
    except OrderClining.DoesNotExist:
        return Response({"error": "Заказ не найден или не принадлежит вам"}, status=404)

    if order.order_status != 'confirmed':
        return Response({"error": "Завершить можно только подтверждённый заказ"}, status=400)

    order.order_status = 'completed'
    order.save()
    return Response({"detail": "Заказ успешно завершён"}, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_review(request):
    serializer = ReviewSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        review = serializer.save()
        review.company.update_average_rating()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_address(request, id):
    address = get_object_or_404(Address, id=id, user=request.user)
    address.delete()
    return Response({"detail": "Адрес удалён"}, status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def service_list(request):
    company = getattr(request.user, "profile", None).company
    services = Service.objects.filter(company=company)
    serializer = ServiceSerializer(services, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_employee(request):
    user_profile = getattr(request.user, 'profile', None)
    if not user_profile or user_profile.status != 'company':
        return Response({'error': 'Только компания может добавлять сотрудников'}, status=403)

    data = request.data
    required_fields = ['first_name', 'last_name', 'email', 'password', 'phone']
    for field in required_fields:
        if not data.get(field):
            return Response({'error': f"Поле {field} обязательно"}, status=400)

    if User.objects.filter(username=data['email']).exists():
        return Response({'error': 'Пользователь с такой почтой уже существует'}, status=400)

    user = User.objects.create_user(
        username=data['email'],
        email=data['email'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        password=data['password']
    )
    UserProfile.objects.create(
        user=user,
        status='employee',
        phone_number=data['phone'],
        company=user_profile.company,
        is_verified=True
    )
    return Response({'detail': 'Сотрудник успешно добавлен'}, status=201)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_company_employees(request):
    user_profile = getattr(request.user, 'profile', None)

    if not user_profile or user_profile.status != 'company':
        return Response({'error': 'Только компания может просматривать сотрудников'}, status=403)

    employees = UserProfile.objects.filter(company=user_profile.company, status='employee')
    serializer = UserProfileSerializer(employees, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([])
def get_company_employees_for_customer(request, company_id):
    try:
        company = CleaningCompany.objects.get(id=company_id)
    except CleaningCompany.DoesNotExist:
        return Response({"error": "Компания не найдена"}, status=404)

    employees = UserProfile.objects.filter(company=company, status='employee')
    serializer = UserProfileSerializer(employees, many=True)
    return Response(serializer.data)


@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def employee_profile_view(request):
    user_profile = request.user.profile

    if request.method == "GET":
        serializer = UserProfileSerializer(user_profile)
        return Response(serializer.data)

    elif request.method == "PUT":
        serializer = UserProfileSerializer(user_profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        print("❌ Ошибка обновления профиля:", serializer.errors)
        return Response(serializer.errors, status=400)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def company_reviews(request):
    user_profile = getattr(request.user, 'profile', None)
    if not user_profile or user_profile.status != 'company':
        return Response({"error": "Только представители компании могут просматривать отзывы"}, status=403)

    company = user_profile.company
    reviews = Review.objects.filter(company=company).select_related("user")
    serializer = ReviewSerializer(reviews, many=True)
    return Response(serializer.data)