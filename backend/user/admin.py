from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as DefaultUserAdmin
from user.models import UserProfile


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = "Profile"
    fk_name = "user"


class UserAdmin(DefaultUserAdmin):
    inlines = (UserProfileInline,)
    list_display = (
        'id', 'email', 'first_name', 'last_name',
        'get_status', 'get_company', 'get_verified', 'is_staff', 'is_active'
    )
    list_select_related = ('profile',)

    def get_status(self, obj):
        return obj.profile.get_status_display() if hasattr(obj, 'profile') else '-'
    get_status.short_description = 'Role'

    def get_company(self, obj):
        return obj.profile.company.name if hasattr(obj.profile, 'company') and obj.profile.company else '-'
    get_company.short_description = 'Company Profile'

    def get_verified(self, obj):
        return obj.profile.is_verified if hasattr(obj.profile, 'is_verified') else False
    get_verified.boolean = True
    get_verified.short_description = 'Is Company Verified'


admin.site.unregister(User)
admin.site.register(User, UserAdmin)
