from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import UserProfile
from backend_company.models import CleaningCompany

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created and not hasattr(instance, 'profile'):
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=CleaningCompany)
def link_profile_to_company(sender, instance, created, **kwargs):
    if created:
        try:
            profile = instance.user.profile
            if profile.status == 'company':
                profile.company = instance
                profile.save()
        except UserProfile.DoesNotExist:
            pass
