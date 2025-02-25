from django.db import models
from django.conf import settings

# Create your models here.




from django.contrib.auth.models import AbstractUser, Permission, Group



# Custom User Model
class CustomUser(AbstractUser):
    phone_number = models.CharField(max_length=15, unique=True)
    email = models.EmailField(unique=True)
    gender = models.CharField(max_length=10, choices=[('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')])
    primary_address  = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    USERNAME_FIELD = 'email'  # Set email as the primary login field
    REQUIRED_FIELDS = ['username', 'phone_number']
    groups = models.ManyToManyField(
        Group,
        related_name='customuser_groups',  # Changed related_name
        blank=True,
        help_text='The groups this user belongs to.',
        related_query_name='customuser',
    )
    
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='customuser_permissions',  # Changed related_name
        blank=True,
        help_text='Specific permissions for this user.',
        related_query_name='customuser',
    )


    def __str__(self):
        return self.username


# Address Model (For Multiple Addresses)
class Address(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15)

    def __str__(self):
        return f"{self.address_line1}, {self.city}, {self.state}"


# Category Model
class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


# Product Model
class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(default='No description available')
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    stock_quantity = models.IntegerField(default=0)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products', default=1, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    brand = models.CharField(max_length=255, default='N/A')
    color = models.CharField(max_length=50, default='N/A')
    size = models.CharField(max_length=50, default='N/A')
    availability = models.BooleanField(default=True)
    rating = models.FloatField(default=0.0)
    reviews = models.IntegerField(default=0)
    expiry_date = models.DateField(default='2025-01-01')
    shipping_cost = models.FloatField(default=0.0)
    seller_name = models.CharField(max_length=255, default='Unknown Seller')
    seller_rating = models.FloatField(default=0.0)
    image = models.ImageField(upload_to='products/', default='products/default.jpg')

    def __str__(self):
        return self.name

from django.utils import timezone
# Orders Model
class Order(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Paid', 'Paid'),
        ('Shipped', 'Shipped'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    address = models.ForeignKey('Address', on_delete=models.SET_NULL, null=True, blank=True)
    order_date = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    coupon_code = models.CharField(max_length=50, blank=True, null=True)
    discount_applied = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    payment = models.OneToOneField('Payment', on_delete=models.SET_NULL, null=True, blank=True, related_name='related_order')
    shipping = models.OneToOneField('Shipping', on_delete=models.SET_NULL, null=True, blank=True, related_name='related_order')
    created_at = models.DateTimeField(default=timezone.now)
    def __str__(self):
        return f"Order #{self.id} - {self.user.username}"


# Order Items Model
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    price_at_order_time = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} x {self.product.name} in Order #{self.order.id}"


# Payment Model
class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('Credit Card', 'Credit Card'),
        ('UPI', 'UPI'),
        ('Net Banking', 'Net Banking'),
        ('Cash', 'Cash'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('Completed', 'Completed'),
        ('Pending', 'Pending'),
        ('Failed', 'Failed'),
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment_detail')
    payment_date = models.DateTimeField(auto_now_add=True)
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES,
                                      default='Cash')
    
    
    
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='Pending')
    transaction_id = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"Payment for Order #{self.order.id} - {self.payment_status}"


# Shipping Model
class Shipping(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='shipping_detail')
    shipping_address = models.TextField()
    shipping_method = models.CharField(max_length=50, default='Standard')
    tracking_number = models.CharField(max_length=100, blank=True, null=True)
    shipped_date = models.DateTimeField(blank=True, null=True)
    delivery_date = models.DateTimeField(blank=True, null=True)
    expected_delivery_date = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Shipping for Order #{self.order.id}"


# Inventory Log Model
class InventoryLog(models.Model):
    CHANGE_TYPE_CHOICES = [
        ('Addition', 'Addition'),
        ('Sale', 'Sale'),
        ('Return', 'Return'),
        ('Adjustment', 'Adjustment'),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='inventory_logs')
    change_type = models.CharField(max_length=20, choices=CHANGE_TYPE_CHOICES)
    quantity_changed = models.IntegerField()
    change_date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)
    changed_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.change_type} of {self.quantity_changed} units for {self.product.name}"
