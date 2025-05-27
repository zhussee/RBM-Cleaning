from django import forms
from backend_company.models import Service


class ServiceForm(forms.ModelForm):
    class Meta:
        model = Service
        fields = ['name_service', 'description', 'lead_time', 'price_per_m2']
