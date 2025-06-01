from rest_framework import serializers
from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    email = serializers.EmailField(source='user.email', required=False)
    avatar = serializers.ImageField(required=False, allow_null=True)
    status = serializers.CharField(source='get_status_display', read_only=True)
    raw_status = serializers.CharField(source='status', read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            'id', 'first_name', 'last_name', 'patronymic', 'phone_number',
            'email', 'avatar', 'status', 'raw_status'
        ]

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user

        for attr, value in user_data.items():
            setattr(user, attr, value)

        request = self.context.get('request')
        if request and 'avatar' in request.FILES:
            instance.avatar = request.FILES['avatar']
        elif 'avatar' in validated_data:
            validated_data.pop('avatar')  # игнорируем, если это строка/невалидный формат

        user.save()
        instance.save()
        return instance


    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['first_name'] = instance.user.first_name
        rep['last_name'] = instance.user.last_name
        rep['email'] = instance.user.email
        rep['avatar'] = instance.avatar.url if instance.avatar else None
        rep['status'] = instance.get_status_display()
        rep['raw_status'] = instance.status
        return rep
