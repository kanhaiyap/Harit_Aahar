from django.core.management.base import BaseCommand
from harit_aahar_app.models import CustomUser, Category, Product, Address, Order, OrderItem, Payment, Shipping, InventoryLog
from django.utils import timezone
import random

class Command(BaseCommand):
    help = 'Seed the database with dummy data'

    def handle(self, *args, **kwargs):
        # Create dummy users
        users = [
            CustomUser.objects.create(username=f'user{i}', email=f'user{i}@example.com', phone_number=f'123456789{i}', gender='Male') 
            for i in range(1, 4)
        ]

        # Create dummy categories
        categories = [
            Category.objects.create(name=f'Category{i}', description=f'Description for Category{i}') 
            for i in range(1, 4)
        ]

        # Create dummy products
        products = [
            Product.objects.create(
                name=f'Product{i}',
                description=f'Description for Product{i}',
                price=random.uniform(10, 100),
                stock_quantity=random.randint(10, 100),
                category=random.choice(categories),
                brand=f'Brand{i}',
                color='Red',
                size='M',
                availability=True,
                rating=random.uniform(1, 5),
                reviews=random.randint(1, 100),
                expiry_date='2025-12-31',
                shipping_cost=random.uniform(5, 20),
                seller_name=f'Seller{i}',
                seller_rating=random.uniform(1, 5)
            ) 
            for i in range(1, 6)
        ]

        # Create dummy addresses
        addresses = [
            Address.objects.create(
                user=random.choice(users),
                address_line1=f'Address Line 1 - {i}',
                address_line2=f'Address Line 2 - {i}',
                city='City',
                state='State',
                postal_code='123456',
                country='Country',
                phone_number=f'987654321{i}'
            )
            for i in range(1, 4)
        ]

        # Create dummy orders
        orders = [
            Order.objects.create(
                user=random.choice(users),
                address=random.choice(addresses),
                total_amount=random.uniform(50, 300),
                status=random.choice(['Pending', 'Paid', 'Shipped']),
                coupon_code=None,
                discount_applied=random.uniform(0, 20),
                created_at=timezone.now()
            )
            for _ in range(3)
        ]

        # Create dummy order items
        for order in orders:
            for product in random.sample(products, 2):
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=random.randint(1, 5),
                    price_at_order_time=product.price
                )

        # Create dummy payments
        for order in orders:
            Payment.objects.create(
                order=order,
                payment_method='Credit Card',
                payment_status=random.choice(['Completed', 'Pending']),
                transaction_id=f'TXN{random.randint(1000,9999)}'
            )

        # Create dummy shipping
        for order in orders:
            Shipping.objects.create(
                order=order,
                shipping_address=order.address.address_line1,
                shipping_method='Standard',
                tracking_number=f'TRACK{random.randint(1000,9999)}',
                shipped_date=timezone.now(),
                delivery_date=None,
                expected_delivery_date=timezone.now() + timezone.timedelta(days=5)
            )

        # Create dummy inventory logs
        for product in products:
            InventoryLog.objects.create(
                product=product,
                change_type=random.choice(['Addition', 'Sale']),
                quantity_changed=random.randint(1, 10),
                notes='Dummy note',
                changed_by=random.choice(users)
            )

        self.stdout.write(self.style.SUCCESS('Successfully added dummy data to the database'))
