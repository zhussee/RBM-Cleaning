from django.db import models
from django.contrib.auth.models import User


def default_avatar_path():
    return 'avatars/default.png'  

class UserProfile(models.Model):
    STATUS_CHOICES = [
        ('user', 'Клиент'),
        ('company', 'Клининговая компания'),
        ('employee', 'Сотрудник'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='user')
    patronymic = models.CharField(max_length=50, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    company = models.ForeignKey("backend_company.CleaningCompany", null=True, blank=True, on_delete=models.SET_NULL)
    is_verified = models.BooleanField(default=False)
    avatar = models.ImageField(
        upload_to='avatars/',
        null=True,
        blank=True,
        default=default_avatar_path  # вот эта строка — ключевая
    )

    def __str__(self):
        return f"{self.user.email} ({self.get_status_display()})"
