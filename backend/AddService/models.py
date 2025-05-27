# from django.db import models
# from backend_company.models import CleaningCompany

# class Service(models.Model):
#     name_service = models.CharField(max_length=255)
#     description = models.TextField(null=True, blank=True)
#     lead_time = models.IntegerField(null=True, blank=True)
#     price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
#     company = models.ForeignKey(CleaningCompany, on_delete=models.CASCADE, related_name="services")


#     class Meta:
#         db_table = 'Service'

#     def __str__(self):
#         return self.name_service
