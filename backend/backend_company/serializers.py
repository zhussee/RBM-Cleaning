from rest_framework import serializers
from django.contrib.auth.models import User
from user.models import UserProfile
from .models import CleaningCompany, Review, Service, OrderClining, Address, AdditionalService


class CompanyProfileUpdateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', required=False)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = CleaningCompany
        fields = ['name', 'description', 'phone', 'logo', 'email', 'password']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        password = validated_data.pop('password', None)

        if user_data:
            email = user_data.get('email')
            if email:
                instance.user.email = email
                instance.user.username = email

        if password:
            instance.user.set_password(password)

        request = self.context.get('request')
        if request and hasattr(request, 'FILES'):
            logo = request.FILES.get('logo')
            if logo:
                instance.logo = logo

        instance.user.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance



class CompanyOrderSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    address_name = serializers.SerializerMethodField()
    employee_name = serializers.SerializerMethodField()
    service_name = serializers.CharField(source='service.name_service', read_only=True)
    status = serializers.CharField(source='order_status', read_only=True)
    created = serializers.DateTimeField(source='created_at', format='%d.%m.%Y %H:%M', read_only=True)
    cleaning_date = serializers.DateField(format='%d.%m.%Y', read_only=True)
    cleaning_time = serializers.CharField(read_only=True)
    payment_type = serializers.SerializerMethodField()

    def get_payment_type(self, obj):
        return obj.get_payment_type_display()

    class Meta:
        model = OrderClining
        fields = [
            'id', 'client_name', 'service_name', 'address_name',
            'total_amount', 'status', 'comment', 'created',
            'cleaning_date', 'employee_name', 'payment_type', 
            'cleaning_time'
        ]


    def get_client_name(self, obj):
        full_name = f"{obj.client.first_name} {obj.client.last_name}".strip()
        return full_name or obj.client.username

    def get_address_name(self, obj):
        parts = [
            f"{obj.address.city}",
            f"ул. {obj.address.street}",
            f"д. {obj.address.house}",
        ]
        if obj.address.apartment:
            parts.append(f"кв. {obj.address.apartment}")
        if obj.address.entrance:
            parts.append(f"подъезд {obj.address.entrance}")
        if obj.address.floor:
            parts.append(f"этаж {obj.address.floor}")
        return ", ".join(parts)


    def get_employee_name(self, obj):
        if obj.employee and obj.employee.user:
            return f"{obj.employee.user.first_name} {obj.employee.user.last_name}".strip()
        return None


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'


class AddressCreateSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Address
        fields = ['user', 'city', 'street', 'house', 'apartment', 'square_meters', 'entrance', 'floor', 'bathrooms']

class AdditionalServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdditionalService
        fields = ['id', 'name', 'price']


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['id', 'name_service', 'description', 'price_per_m2', 'lead_time']


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'comment', 'rating', 'created_at', 'order']

    def get_user(self, obj):
        full_name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return full_name if full_name else obj.user.username
    
    def create(self, validated_data):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Пользователь не авторизован")

        order = validated_data.get('order')
        if not order:
            raise serializers.ValidationError("Не указан заказ")

        if Review.objects.filter(order=order).exists():
            raise serializers.ValidationError("Отзыв для этого заказа уже существует")

        validated_data['user'] = request.user
        validated_data['company'] = order.company

        review = super().create(validated_data)
        review.company.update_average_rating()
        return review


class CleaningCompanySerializer(serializers.ModelSerializer):
    average_rating = serializers.FloatField(read_only=True)
    services = ServiceSerializer(many=True, read_only=True)

    class Meta:
        model = CleaningCompany
        fields = '__all__'


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['id', 'name_service', 'description', 'price_per_m2', 'lead_time']


class AdditionalServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdditionalService
        fields = ['id', 'name', 'price', 'company']
        read_only_fields = ['company']


class OrderCliningSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    service_name = serializers.CharField(source='service.name_service', read_only=True)
    address_name = serializers.SerializerMethodField()
    status = serializers.CharField(source='order_status', read_only=True)
    status_display = serializers.SerializerMethodField()
    has_review = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(source='order_date', read_only=True)
    cleaning_date = serializers.DateField(required=False)
    cleaning_time = serializers.CharField(required=False)
    employee_name = serializers.SerializerMethodField() 
    employee = serializers.PrimaryKeyRelatedField(
        queryset=UserProfile.objects.filter(status='employee'),
        required=False,
        allow_null=True
    )
    payment_type = serializers.SerializerMethodField()

    def get_payment_type(self, obj):
        return obj.get_payment_type_display()


    class Meta:
        model = OrderClining
        fields = [
            'id', 'company', 'service', 'address', 'total_amount',
            'company_name', 'service_name', 'address_name',
            'employee', 'employee_name', 'comment', 'payment_type',
            'status', 'status_display', 'has_review', 'created_at',
            'cleaning_date', 'cleaning_time'
        ]

    def get_address_name(self, obj):
        parts = [
            f"{obj.address.city}",
            f"ул. {obj.address.street}",
            f"д. {obj.address.house}",
        ]
        if obj.address.apartment:
            parts.append(f"кв. {obj.address.apartment}")
        if obj.address.entrance:
            parts.append(f"подъезд {obj.address.entrance}")
        if obj.address.floor:
            parts.append(f"этаж {obj.address.floor}")
        return ", ".join(parts)

    def get_status_display(self, obj):
        return obj.get_order_status_display()

    def get_has_review(self, obj):
        return hasattr(obj, 'review')

    def get_employee_name(self, obj):
        if obj.employee and obj.employee.user:
            return f"{obj.employee.user.first_name} {obj.employee.user.last_name}".strip()
        return None


    def create(self, validated_data):
        request = self.context.get("request")
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            validated_data['client'] = request.user
        else:
            raise serializers.ValidationError("Не удалось определить пользователя")
        print("✅ validated_data при сохранении:", validated_data)
        return super().create(validated_data)


class CompanyAccountCreateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)
    name = serializers.CharField()
    description = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = CleaningCompany
        fields = ['email', 'password', 'name', 'description']

    def create(self, validated_data):
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        name = validated_data.pop('name')
        description = validated_data.pop('description', '')

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            is_active=True
        )

        UserProfile.objects.create(user=user, status='company')

        company = CleaningCompany.objects.create(user=user, name=name, description=description)
        return company
