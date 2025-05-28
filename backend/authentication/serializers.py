from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from user.models import UserProfile
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator

class RegistrationSerializer(serializers.ModelSerializer):
    password1 = serializers.CharField(
        write_only=True, required=True, style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True, required=True, style={'input_type': 'password'}
    )
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ('email', 'password1', 'password2')

    def validate_email(self, value):
        existing_user = User.objects.filter(email=value).first()
        if existing_user:
            if not existing_user.is_active:
                existing_user.delete()  # или можно повторно активировать
            else:
                raise serializers.ValidationError("Пользователь с такой почтой уже существует.")
        return value

    def validate(self, data):
        if data['password1'] != data['password2']:
            raise serializers.ValidationError("Пароли не совпадают.")
        validate_password(data['password1'])
        return data

    def create(self, validated_data):
        from django.utils.http import urlsafe_base64_encode
        from django.utils.encoding import force_bytes
        from django.contrib.auth.tokens import default_token_generator
        from django.template.loader import render_to_string
        from django.core.mail import EmailMessage
        from django.conf import settings

        email = validated_data.get('email')
        password = validated_data.get('password1')

        # создаём пользователя неактивным
        user = User.objects.create(username=email, email=email, is_active=False)
        user.set_password(password)
        user.save()
        # # создаём профиль с ролью 'user'
        # UserProfile.objects.create(user=user, status='user')
        user.profile.status = 'user'
        user.profile.save()

        # создаём uid и токен
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        # формируем ссылку на фронтенд-
        confirm_link = f"{settings.FRONTEND_URL}/confirm_email/{uid}/{token}/"

        # рендерим HTML-шаблон письма
        html_content = render_to_string('authentication/email_confirmation.html', {
            'confirm_link': confirm_link,
        })

        # создаём и отправляем письмо
        email_message = EmailMessage(
            subject='Подтверждение регистрации RBM Cleaning',
            body=html_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email]
        )
        email_message.content_subtype = 'html'  # задаём HTML-формат
        email_message.send()

        return user


class MyTokenObtainPairSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if email and password:
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                raise serializers.ValidationError({"detail": "Пользователь не найден."})

            if not user.is_active:
                raise serializers.ValidationError({"detail": "Пользователь не активирован."})

            if not user.check_password(password):
                raise serializers.ValidationError({"detail": "Неверный пароль."})

            # Сохраняем в контекст для использования в get_token
            self.user = user
            return {}
        else:
            raise serializers.ValidationError({"detail": "Введите email и пароль."})

    @classmethod
    def get_token(cls, user):
        token = TokenObtainPairSerializer.get_token(user)
        token['email'] = user.email
        token['user_id'] = user.id
        token['status'] = user.profile.status 
        return token

    def validate_attrs(self, data):
        return data


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            self.user = User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("Пользователь с таким email не найден.")
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)

    def validate(self, data):
        try:
            uid = force_str(urlsafe_base64_decode(data['uid']))
            self.user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError):
            raise serializers.ValidationError("Неверный UID.")

        if not default_token_generator.check_token(self.user, data['token']):
            raise serializers.ValidationError("Неверный или просроченный токен.")

        validate_password(data['new_password'])
        return data

    def save(self):
        self.user.set_password(self.validated_data['new_password'])
        self.user.save()