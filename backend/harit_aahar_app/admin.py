from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Address, Category, Product, Order, OrderItem, Payment, Shipping, InventoryLog  # Import your custom user model

User = get_user_model()  # ✅ Get the correct user model dynamically

# First, check if it's registered before unregistering
if admin.site.is_registered(User):
    admin.site.unregister(User)  # ✅ Only unregister if it's registered

# Register the CustomUser model
@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'phone_number', 'is_staff', 'is_active')
    search_fields = ('username', 'email', 'phone_number')
    list_filter = ('is_staff', 'is_active')

admin.site.register(Address)
admin.site.register(Category)
admin.site.register(Product)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Payment)
admin.site.register(Shipping)

admin.site.register(InventoryLog)
