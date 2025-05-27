from rest_framework import serializers
from backend_company.models import Service


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['id', 'name_service', 'description', 'lead_time', 'price_per_m2', 'company']
        read_only_fields = ['company']  

    def create(self, validated_data):
        request = self.context.get('request')
        profile = getattr(request.user, 'profile', None)
        if not profile or not profile.company:
            raise serializers.ValidationError("Профиль компании не найден")

        validated_data['company'] = profile.company
        return super().create(validated_data)
