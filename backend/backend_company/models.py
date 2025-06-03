from django.db import models
from django.contrib.auth.models import User
from user.models import UserProfile
from django.db.models import Avg
from django.utils import timezone


class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="addresses")
    city = models.CharField(max_length=100)
    street = models.CharField(max_length=100)
    house = models.CharField(max_length=20)
    apartment = models.CharField(max_length=20, blank=True, null=True)
    square_meters = models.PositiveIntegerField(default=0)
    entrance = models.CharField(max_length=10, blank=True, null=True)
    floor = models.PositiveIntegerField(blank=True, null=True)
    bathrooms = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.city}, ул. {self.street}, д. {self.house}, кв. {self.apartment}"


class CleaningCompany(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    phone = models.CharField(max_length=20)
    address = models.CharField(max_length=255)
    email = models.EmailField()
    logo = models.ImageField(upload_to='company/', blank=True, null=True)
    average_rating = models.FloatField(default=0.0)

    def __str__(self):
        return self.name

    def update_average_rating(self):
        average = self.reviews.aggregate(avg=Avg('rating'))['avg']
        self.average_rating = round(average or 0, 1)
        self.save(update_fields=['average_rating'])


class AdditionalService(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    company = models.ForeignKey(CleaningCompany, on_delete=models.CASCADE, related_name="additional_services")

    def __str__(self):
        return self.name


class Service(models.Model):
    company = models.ForeignKey(CleaningCompany, on_delete=models.CASCADE, related_name='services')
    name_service = models.CharField(max_length=255)
    description = models.TextField()
    lead_time = models.IntegerField(help_text="Время выполнения в минутах")
    price_per_m2 = models.DecimalField(max_digits=10, decimal_places=2, help_text="Цена за м²")

    def __str__(self):
        return self.name_service


class OrderClining(models.Model):
    client = models.ForeignKey(User, on_delete=models.CASCADE)
    company = models.ForeignKey(CleaningCompany, on_delete=models.CASCADE)
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    additional_services = models.ManyToManyField(AdditionalService, blank=True)
    address = models.ForeignKey(Address, on_delete=models.CASCADE)
    order_date = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    order_status = models.CharField(max_length=50, choices=[
        ('new', 'Новый'),
        ('confirmed', 'Принятый'),
        ('completed', 'Завершенён'),
        ('canceled', 'Отменён'),
    ], default='new')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    employee = models.ForeignKey(
        "user.UserProfile",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="orders"
    )
    comment = models.TextField(blank=True, null=True)
    cleaning_date = models.DateField(null=True, blank=True)
    cleaning_time = models.CharField(max_length=20, null=True, blank=True)
    payment_choices = [
        ('cash', 'Наличная'),
        ('card', 'Картой'),
        ('kaspi_qr', 'Kaspi QR'),
    ]
    payment_type = models.CharField(
        max_length=20,
        choices=payment_choices,
        default='cash'
    )
    invoice_id = models.CharField(max_length=100, blank=True, null=True)
    payment_token = models.CharField(max_length=255, blank=True, null=True)
    payment_token_created = models.DateTimeField(blank=True, null=True)
    cancel_reason = models.TextField(blank=True, null=True)
    def __str__(self):
        return f"Order #{self.id} from {self.client.username}"


class Review(models.Model):
    order = models.OneToOneField(OrderClining, on_delete=models.CASCADE, related_name='review')
    company = models.ForeignKey(CleaningCompany, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.company.name} — {self.rating}★ от {self.user.username}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.company.update_average_rating()
