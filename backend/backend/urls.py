from django.contrib import admin
from django.urls import path, include
from AddService import views as add_views
from django.conf import settings
from django.conf.urls.static import static

from backend_company.views import (
    create_order,
    create_address,
    my_addresses,
    delete_address,
    user_orders,
    create_review,
    payment_callback,
    cancel_order,
    confirm_order,
    complete_order,
    available_orders_for_employee,
    service_list,
    employee_profile_view,
    create_employee,
)

urlpatterns = [
    path('api/admin/', admin.site.urls),
    # Аутентификация и профиль
    path('api/auth/', include('authentication.urls')),
    path('api/user/', include('user.urls')),

    # Главная и сервисы
    path('', add_views.service_list, name='home'),
    path('service/add/', add_views.add_service, name='add_service'),
    path('service/list/', add_views.service_list, name='service_list'),
    path('api/services_add/', add_views.service_list_create, name='service_list'),

    path('api/services/', service_list, name='service_list'),
    path('api/additional-services/', add_views.additional_service_list, name='additional_service_list'),


    # Компании
    path('api/company/', include('backend_company.urls')),

    # Заказы, адреса, отзывы
    path('api/orders/', create_order, name='create_order'),
    path('api/addresses/', create_address, name='create_address'),
    path('api/user/addresses/', my_addresses, name='user_addresses'),
    path('api/user/orders/', user_orders, name='user_orders'),
    path('api/orders/<int:order_id>/cancel/', cancel_order),
    path('api/reviews/', create_review, name='create_review'),
    path('api/user/addresses/<int:id>/', delete_address, name='delete_address'),
    path('api/orders/<int:order_id>/confirm/', confirm_order, name='confirm_order_by_company'),
    path('api/employee/orders/<int:order_id>/complete/', complete_order, name='complete_order'),
    path('api/employee/orders/available/', available_orders_for_employee, name='available_orders_for_employee'),
    path("api/employees/profile/update/", employee_profile_view, name="employee_profile_update"),
    path('api/employees/create/', create_employee, name='create_employee'),
    # Оплата картой
    path('payment/callback/', payment_callback),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
