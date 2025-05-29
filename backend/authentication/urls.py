from django.urls import path
from .api_views import (
    register_api,
    resend_confirmation_email,
    confirm_email_api,
    MyTokenObtainPairView,
    password_reset_request, 
    password_reset_confirm,
    user_status_view
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', register_api, name='register'),
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'), 
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('resend-confirmation/', resend_confirmation_email, name='resend_confirmation'),
    path('confirm-email/<uidb64>/<token>/', confirm_email_api, name='confirm_email'),
    path('password-reset/', password_reset_request, name='password_reset'),
    path('password-reset-confirm/', password_reset_confirm, name='password_reset_confirm'),
    path('status/', user_status_view, name='user_status'),
]
