from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.shortcuts import redirect  
from .serializers import RegistrationSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer, MyTokenObtainPairSerializer
from django.template.loader import render_to_string
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken


# 👉 Регистрация
@api_view(['POST'])
def register_api(request):
    serializer = RegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        user.is_active = False
        user.save()
        send_confirmation_email(user)
        return Response(
            {"detail": "Регистрация успешна. Подтвердите почту."},
            status=status.HTTP_201_CREATED
        )

    print("Ошибки валидации:", serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# 👉 Повторная отправка письма
@api_view(['POST'])
def resend_confirmation_email(request):
    email = request.data.get('email')
    if not email:
        return Response({"detail": "Email не указан."}, status=status.HTTP_400_BAD_REQUEST)

    user = get_object_or_404(User, email=email)
    if user.is_active:
        return Response({"detail": "Учетная запись уже активирована."}, status=status.HTTP_400_BAD_REQUEST)

    send_confirmation_email(user)
    return Response({"detail": "Письмо отправлено повторно."}, status=status.HTTP_200_OK)


@api_view(['GET'])
def confirm_email_api(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (User.DoesNotExist, ValueError, TypeError, OverflowError):
        return Response({"detail": "Неверная ссылка."}, status=status.HTTP_400_BAD_REQUEST)

    if default_token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        print(f"✅ Пользователь {user.email} активирован: {user.is_active}")
        return Response({"detail": "Почта подтверждена."}, status=status.HTTP_200_OK)
    else:
        return Response({"detail": "Ссылка недействительна или устарела."}, status=status.HTTP_400_BAD_REQUEST)



# 👉 Отправка email подтверждения
def send_confirmation_email(user):
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    confirm_url = f"{settings.FRONTEND_URL}/confirm_email/{uid}/{token}/"

    subject = "Подтверждение регистрации"
    message = f"Нажмите на ссылку, чтобы подтвердить почту: {confirm_url}"

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )
    

@api_view(['POST'])
def password_reset_request(request):
    serializer = PasswordResetRequestSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.user
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_url = f"{settings.FRONTEND_URL}/password-reset-confirm/{uid}/{token}/"

        # HTML письмо
        html_message = render_to_string('authentication/password_reset.html', {
            'reset_link': reset_url,
        })

        send_mail(
            subject="Сброс пароля",
            message=f"Сброс пароля: {reset_url}",  # на случай, если HTML не поддерживается
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        return Response({"detail": "Инструкция по сбросу пароля отправлена на email."})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def password_reset_confirm(request):
    serializer = PasswordResetConfirmSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"detail": "Пароль успешно изменён."})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyTokenObtainPairView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = MyTokenObtainPairSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.user
        refresh = RefreshToken.for_user(user)

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "email": user.email,
            "user_id": user.id,
        }, status=status.HTTP_200_OK)
