from rest_framework import serializers
from .models import Product, Order, Payment, Category, Address, InventoryLog

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
    def validate_category(self, value):
        if not value:
            raise serializers.ValidationError("Category must be provided.")
        return value

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True, read_only=True)  # ✅ Include related products

    class Meta:
        model = Category
        fields = ["id", "name", "description", "products"]

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'




class InventoryLogSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name")  # ✅ Get product name
    changed_by = serializers.CharField(source="changed_by.username", allow_null=True)

    class Meta:
        model = InventoryLog
        fields = ['id', 'product_name', 'change_type', 'quantity_changed', 'change_date', 'notes', 'changed_by']
