from django.contrib import admin
from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password

from .models import CleaningCompany, Review, Service, OrderClining, Address, AdditionalService
from user.models import UserProfile


class CleaningCompanyAdminForm(forms.ModelForm):
    email = forms.EmailField(label="Email (логин)")
    password = forms.CharField(widget=forms.PasswordInput, label="Пароль")

    class Meta:
        model = CleaningCompany
        fields = '__all__'

    def save(self, commit=True):
        instance = super().save(commit=False)
        email = self.cleaned_data.get("email")
        password = self.cleaned_data.get("password")

        if not instance.user:
            user = User.objects.create(
                username=email,
                email=email,
                password=make_password(password),
                is_active=True
            )
            UserProfile.objects.create(user=user, status='company')
            instance.user = user

        if commit:
            instance.save()
            self.save_m2m()
        return instance


class ServiceInline(admin.TabularInline):  
    model = Service
    extra = 0


class CleaningCompanyAdmin(admin.ModelAdmin):
    form = CleaningCompanyAdminForm
    list_display = ['name', 'get_user_email', 'phone', 'address', 'average_rating']
    readonly_fields = ['average_rating']
    inlines = [ServiceInline]  

    def get_user_email(self, obj):
        return obj.user.email if obj.user else "-"
    get_user_email.short_description = "Email"


# 📦 Регистрация всех моделей
admin.site.register(CleaningCompany, CleaningCompanyAdmin)
admin.site.register(Review)
admin.site.register(Service)
admin.site.register(OrderClining)
admin.site.register(Address)
admin.site.register(AdditionalService)
