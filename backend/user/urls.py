from django.urls import path
from .views import profile_view, employee_profile_view
from backend_company.views import employee_orders, complete_order

urlpatterns = [
    path('profile/', profile_view, name='profile'),
    path('employees/profile/', employee_profile_view, name='employee_profile'),
    path('employees/orders/', employee_orders, name='employee_orders'),
    path('employees/orders/<int:order_id>/complete/', complete_order, name='complete_order_by_employee'),
]