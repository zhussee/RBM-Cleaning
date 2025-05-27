from django.urls import path
from . import views
from AddService.views import service_list_create, additional_service_list
from .views_ai import AiChatView

urlpatterns = [
    path('profile/', views.company_profile),
    path('create/', views.create_company_account),
    path('orders/', views.company_orders),
    path('<int:id>/', views.company_detail),
    path('', views.company_list),
    path('orders/<int:order_id>/confirm/', views.confirm_order, name='confirm_order'),
    path('services/', service_list_create, name='service_list_api'),
    path('additional-services/', additional_service_list, name='additional_service_list_api'),
    path('employees/add/', views.add_employee),
    path('employees/', views.get_company_employees, name='get_company_employees'),
    path('employees/orders/<int:order_id>/complete/',  views.complete_order, name='complete_order'),
    path('public/employees/<int:company_id>/', views.get_company_employees_for_customer),
    path("ai/chat/", AiChatView.as_view(), name="ai-chat"),
    path('reviews/', views.company_reviews, name='company_reviews'),
]
