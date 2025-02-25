from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.conf import settings
from django.core.mail import send_mail
from django.http import JsonResponse
import razorpay
import random
from .models import Product, Order, Payment, Category, Address
from .serializers import ProductSerializer, OrderSerializer, PaymentSerializer, CategorySerializer, AddressSerializer


from django.shortcuts import render

def home(request):
    return render(request, 'index.html')


# Razorpay client setup
razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_SECRET_KEY))
from rest_framework.response import Response
from rest_framework import viewsets, status
from .models import Product
from .serializers import ProductSerializer
from rest_framework.decorators import action
from rest_framework import permissions
class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.AllowAny]
    
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    @action(detail=False, methods=['post'], url_path='update')
    def update_products(self, request):
        print("Received update request:", request.data)  # Debug log to see the incoming data
        
        products_data = request.data

        for product_data in products_data:
            print("Processing product:", product_data)  # Debug log for each product
            
            product_id = product_data.get('id')
            if product_id:
                try:
                    product = Product.objects.get(id=product_id)
                    serializer = ProductSerializer(product, data=product_data, partial=True)
                    if serializer.is_valid():
                        serializer.save()
                    else:
                        print("Validation error:", serializer.errors)  # Log validation errors
                        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                except Product.DoesNotExist:
                    return Response({"error": f"Product with id {product_id} does not exist."}, status=status.HTTP_404_NOT_FOUND)
            else:
                serializer = ProductSerializer(data=product_data)
                if serializer.is_valid():
                    serializer.save()
                else:
                    print("Validation error on new product:", serializer.errors)  # Log new product errors
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response({'success': True, 'message': 'Products updated successfully!'}, status=status.HTTP_200_OK)

# Order ViewSet
class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

# Payment ViewSet
class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer

# Category ViewSet
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    

# Address ViewSet
class AddressViewSet(viewsets.ModelViewSet):
    queryset = Address.objects.all()
    serializer_class = AddressSerializer

# Add to Cart API
class AddToCartView(APIView):
    def post(self, request, product_id):
        cart = request.session.get('cart', {})
        product = get_object_or_404(Product, id=product_id)

        if str(product_id) in cart:
            cart[str(product_id)] += 1
        else:
            cart[str(product_id)] = 1

        request.session['cart'] = cart
        request.session.modified = True

        return Response({'message': 'Product added to cart'}, status=status.HTTP_200_OK)

# View Cart API
class CartView(APIView):
    def get(self, request):
        cart = request.session.get('cart', {})
        products = Product.objects.filter(id__in=cart.keys())
        cart_items = [
            {
                'product': ProductSerializer(product).data,
                'quantity': cart[str(product.id)],
                'total_price': product.price * cart[str(product.id)]
            } for product in products
        ]
        return Response({'cart_items': cart_items}, status=status.HTTP_200_OK)

# Create Order API
class CreateOrderView(APIView):
    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

        total_price = request.data.get('total_price')
        address_id = request.data.get('address_id')

        if not total_price or not address_id:
            return Response({'error': 'Missing total price or address'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            total_price = float(total_price)
            total_amount_paise = int(total_price * 100)
            address = Address.objects.get(id=address_id, user=request.user)
        except (ValueError, Address.DoesNotExist):
            return Response({'error': 'Invalid total price or address'}, status=status.HTTP_400_BAD_REQUEST)

        order = Order.objects.create(
            user=request.user,
            total_amount=total_price,
            status='Pending',
            address=address
        )

        razorpay_order = razorpay_client.order.create({
            'amount': total_amount_paise,
            'currency': 'INR',
            'payment_capture': '1',
        })

        order.razorpay_order_id = razorpay_order['id']
        order.save()

        return Response({'order_id': order.id, 'razorpay_order': razorpay_order}, status=status.HTTP_201_CREATED)


from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import razorpay
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication, SessionAuthentication

class CreateRazorpayOrder(APIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]  # ✅ Ensure proper authentication
    permission_classes = [IsAuthenticated]  # ✅ Ensure only logged-in users can access

    def post(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({'error': 'Authentication credentials were not provided.'}, status=403)

        try:
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_SECRET_KEY))
            amount = int(request.data.get('amount', 0)) * 100  # Convert to paise
            
            if amount <= 0:
                return Response({'error': 'Invalid amount'}, status=400)

            order_data = {
                'amount': amount,
                'currency': 'INR',
                'payment_capture': '1',
            }

            razorpay_order = client.order.create(order_data)
            return Response({
                'order_id': razorpay_order['id'],
                'amount': amount,
                'key': settings.RAZORPAY_KEY_ID
            })

        except Exception as e:
            return Response({'error': str(e)}, status=500)




# Verify Payment API
class VerifyPaymentView(APIView):
    def post(self, request):
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_signature = request.data.get('razorpay_signature')

        if not razorpay_payment_id or not razorpay_order_id or not razorpay_signature:
            return Response({'error': 'Missing payment details'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            razorpay_client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            })

            order = Order.objects.get(razorpay_order_id=razorpay_order_id)
            order.status = 'Paid'
            order.save()

            Payment.objects.create(
                order=order,
                razorpay_payment_id=razorpay_payment_id,
                razorpay_order_id=razorpay_order_id,
                payment_status='Success'
            )

            return Response({'status': 'success'}, status=status.HTTP_200_OK)

        except razorpay.errors.SignatureVerificationError:
            return Response({'status': 'failed'}, status=status.HTTP_400_BAD_REQUEST)


# Contact Form API
class ContactView(APIView):
    def post(self, request):
        name = request.data.get('name')
        email = request.data.get('email')
        message = request.data.get('message')

        subject = f"Message from {name}"
        body = f"Name: {name}\nEmail: {email}\nMessage: {message}"
        recipient_email = 'your-email@example.com'

        send_mail(subject, body, email, [recipient_email])

        return Response({'message': 'Thank you for contacting us!'}, status=status.HTTP_200_OK)


from django.http import JsonResponse
from .models import Product

def get_products(request):
    if request.method == 'GET':
        products = Product.objects.all().values()
        return JsonResponse(list(products), safe=False)





from twilio.rest import Client
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import random
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view, permission_classes 
from django.middleware.csrf import get_token
from rest_framework.permissions import AllowAny

@api_view(['GET'])
@permission_classes([AllowAny]) 
 # Only for testing; remove this in production
def get_csrf_token1(request):
    csrf_token = get_token(request)
    print("✅ CSRF Token Generated:", csrf_token) 
    return JsonResponse({'csrfToken': csrf_token})

@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie  # Ensures Django sets the CSRF cookie
def get_csrf_token(request):
    csrf_token = get_token(request)
    response = JsonResponse({'csrfToken': csrf_token})
    
    # response["Access-Control-Allow-Credentials"] = "true"  # Ensures frontend can receive cookies
    response.set_cookie(
        "csrftoken",
        csrf_token,
        
        httponly=False,  # Allow frontend to access
        samesite="Lax",  # Prevent CSRF attacks while allowing cross-origin
        secure=False  # Set to True in production
    )

    print("✅ CSRF Token Generated:", csrf_token)  # Debugging log
    return response

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.permissions import AllowAny
from django.core.cache import cache 


class SendOTPView(APIView):
    permission_classes = [AllowAny]  # Allow unauthenticated users

    def post(self, request):
        phone_number = request.data.get('phone_number')
        if not phone_number:
            return Response({'error': 'Phone number is required'}, status=status.HTTP_400_BAD_REQUEST)

        otp = random.randint(100000, 999999)
        # request.session['otp'] = otp  # Store OTP in session
        cache.set(f'otp_{phone_number}', otp, timeout=300)

        try:
            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            message = client.messages.create(
                body=f'Your OTP is {otp}',
                from_=settings.TWILIO_WHATSAPP_FROM,
                to=f'whatsapp:{phone_number}'
            )
            return Response({'success': True, 'message': 'OTP sent successfully'}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'success': False, 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VerifyOTPView(APIView):
    permission_classes = [AllowAny]  # ✅ Allow public access

    def post(self, request):
        phone_number = request.data.get('phone_number')
        user_otp = request.data.get('otp')

        # ✅ Fetch OTP from cache instead of session
        stored_otp = cache.get(f'otp_{phone_number}')

        print(f"📌 Debug: Stored OTP: {stored_otp}, Received OTP: {user_otp}")

        if not stored_otp:
            return Response({'success': False, 'message': 'OTP expired or not found'}, status=status.HTTP_400_BAD_REQUEST)

        if str(user_otp) == str(stored_otp):  # ✅ Compare OTPs as strings
            cache.delete(f'otp_{phone_number}')  # ✅ Remove OTP after verification
            return Response({'success': True, 'message': 'OTP verified successfully'}, status=status.HTTP_200_OK)

        return Response({'success': False, 'message': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
    
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.middleware.csrf import get_token
from rest_framework.authentication import SessionAuthentication

User = get_user_model()
class SignupView(APIView):
    authentication_classes = [SessionAuthentication]  # ✅ Ensures CSRF token works
    permission_classes = [AllowAny]

    def post(self, request):
        csrf_token = get_token(request)  # Ensure CSRF token is included

        # Fetch data from request
        phone_number = request.data.get('phone')
        username = request.data.get('name')  # Check if frontend sends 'name'
        email = request.data.get('email')
        password = request.data.get('password')

        # Validate required fields
        if not (phone_number and username and email and password):
            return Response({'success': False, 'message': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if username already exists
        if User.objects.filter(username=username).exists():
            return Response({'success': False, 'message': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

        # Create user
        user = User.objects.create_user(username=username, phone_number=phone_number, email=email, password=password)

        return Response({'success': True, 'message': 'Signup successful', 'csrfToken': csrf_token}, status=status.HTTP_201_CREATED)


from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.middleware.csrf import get_token
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token 

User = get_user_model()

class LoginView(APIView):
    permission_classes = [AllowAny] 
    def post(self, request):
        username = request.data.get("username")  # Email or Phone Number
        password = request.data.get("password")
        print(f"📌 DEBUG: Received username={username}, password={password}")


        if not username or not password:
            return Response({"error": "Email/Phone and Password required"}, status=status.HTTP_400_BAD_REQUEST)
        
      
        # ✅ Authenticate user
        user = authenticate(request, username=username, password=password)
        print(f"📌 DEBUG: Authentication Result: {user}")

        if user:
            login(request, user)
            
            request.session.save()
            token, created=Token.objects.get_or_create(user=user)
            return Response({
                "success": True,
                "message": "Login successful",
                "csrfToken": get_token(request),
                "authToken": token.key,
                "user": {
                    "id": user.id,
                    "name": user.username,
                    "email": user.email,
                    "phone": user.phone_number,
                }
            })
        else:
            print(f"❌ DEBUG: Authentication failed for {username}") 
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)



from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    user_identifier = request.data.get('user_identifier')
    new_password = request.data.get('new_password')

    if not user_identifier or not new_password:
        return Response({'success': False, 'message': 'Missing required fields'}, status=400)

    try:
        user = User.objects.get(email=user_identifier) if '@' in user_identifier else User.objects.get(phone_number=user_identifier)
        user.password = make_password(new_password)
        user.save()
        return Response({'success': True, 'message': 'Password reset successful'}, status=200)
    except ObjectDoesNotExist:
        return Response({'success': False, 'message': 'User not found'}, status=404)


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Order, Address
from .serializers import OrderSerializer, AddressSerializer

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user

    # ✅ Debugging logs
    print(f"📌 DEBUG: Authenticated User: {user}")  # Should print username
    print(f"📌 DEBUG: Is Authenticated: {user.is_authenticated}")  # Should be True

    # Ensure user is authenticated
    if not user.is_authenticated:
        return Response({'error': 'Authentication credentials were not provided.'}, status=403)

    orders = Order.objects.filter(user=user).values('id', 'total_amount', 'status')
    addresses = list(Address.objects.filter(user=user).values(
        'id',
        'address_line1',  # ✅ Corrected field name
        'address_line2',  # ✅ Corrected field name
        'city',
        'state',
        'postal_code',  # ✅ Corrected from "zipcode"
        'country',
        'phone_number'  # ✅ Include phone number for verification
    ))

    return Response({
        'name': user.username,
        'email': user.email,
        'phone_number': user.phone_number,
        'orders': list(orders),  # ✅ Send orders as a list
        'addresses':list(addresses)
    })



# ✅ Fetch User Orders
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_orders(request):
    orders = Order.objects.filter(user=request.user).prefetch_related('items', 'address')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

# ✅ Fetch User Addresses
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_addresses(request):
    addresses = Address.objects.filter(user=request.user)
    serializer = AddressSerializer(addresses, many=True)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_address(request, address_id):
    try:
        address = Address.objects.get(id=address_id, user=request.user)
    except Address.DoesNotExist:
        return Response({"error": "Address not found"}, status=404)

    # ✅ Update address fields
    address.address_line1 = request.data.get('address_line1', address.address_line1)
    address.city = request.data.get('city', address.city)
    address.state = request.data.get('state', address.state)
    address.postal_code = request.data.get('postal_code', address.postal_code)
    address.save()

    return Response({"message": "Address updated successfully", "address": {
        "id": address.id,
        "address_line1": address.address_line1,
        "city": address.city,
        "state": address.state,
        "postal_code": address.postal_code
    }})


from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required, user_passes_test
from .models import Category, OrderItem, Shipping

# ✅ Helper function to check if user is staff
def is_staff(user):
    return user.is_authenticated and user.is_staff

# ✅ Staff-only view for order items
@login_required
@user_passes_test(is_staff)
def order_item_list(request):
    order_items = OrderItem.objects.all()
    return render(request, 'staff/order_item_list.html', {'order_items': order_items})

# ✅ Staff-only view for shipping details
@login_required
@user_passes_test(is_staff)
def shipping_list(request):
    shippings = Shipping.objects.all()
    return render(request, 'staff/shipping_list.html', {'shippings': shippings})




from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from .models import InventoryLog
from .serializers import InventoryLogSerializer

@api_view(['GET'])
@permission_classes([IsAdminUser])  # ✅ Only staff users can access this API
def get_inventory_logs(request):
    logs = InventoryLog.objects.all().order_by('-change_date')  # Fetch latest logs first
    serializer = InventoryLogSerializer(logs, many=True)
    return Response(serializer.data)










from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

@api_view(["POST"])  # ✅ Ensure this explicitly allows POST requests
@permission_classes([AllowAny])  # ✅ Allow unauthenticated users to log in
def admin_login(request):
    print("📌 Received Login Request")

    username = request.data.get("username")
    password = request.data.get("password")

    print(f"🔍 Username: {username}, Password: {password}")

    if not username or not password:
        print("❌ Missing Username or Password")
        return JsonResponse({"error": "Username and password are required."}, status=400)

    user = authenticate(username=username, password=password)

    if user:
        print(f"✅ Authentication successful for {username}")
        login(request, user)
        return JsonResponse({"success": True, "token": "your_auth_token"})  # ✅ Replace with a real token system
    else:
        print("❌ Invalid credentials")
        return JsonResponse({"error": "Invalid credentials"}, status=401)





from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer

@api_view(["GET"])
def get_category_products(request, category_id):
    category = get_object_or_404(Category, id=category_id)
    products = category.products.all()  # ✅ Fetch all products in this category
    serialized_products = ProductSerializer(products, many=True)
    
    return Response({
        "category": CategorySerializer(category).data,
        "products": serialized_products.data
    })


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Category
from .serializers import CategorySerializer

@api_view(["GET"])
@permission_classes([AllowAny])
@csrf_exempt  # ✅ Disables CSRF protection temporarily
def category_list(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_protect
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser
import csv
import io

from .models import Category, Product

@api_view(["POST"])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser])
@csrf_protect  # ✅ Requires CSRF Token
def upload_csv(request):
    if "file" not in request.FILES:
        return JsonResponse({"error": "No file provided"}, status=400)

    file = request.FILES["file"]
    if not file.name.endswith(".csv"):
        return JsonResponse({"error": "Invalid file format. Please upload a CSV file."}, status=400)

    try:
        data = io.StringIO(file.read().decode("utf-8"))
        reader = csv.reader(data)
        next(reader, None)  # Skip header

        created_categories, created_products = 0, 0
        for row in reader:
            if len(row) < 3:
                continue

            category_name, product_name, price = row[0], row[1], row[2]
            category, created = Category.objects.get_or_create(name=category_name)
            if created:
                created_categories += 1

            Product.objects.create(
                name=product_name,
                price=float(price),
                category=category
            )
            created_products += 1

        return JsonResponse({
            "message": f"CSV uploaded successfully! {created_categories} categories, {created_products} products added."
        }, status=200)

    except Exception as e:
        return JsonResponse({"error": f"Internal Server Error: {str(e)}"}, status=500)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.http import JsonResponse
from .models import Category
from .serializers import CategorySerializer
@csrf_exempt
@api_view(["GET"])
@permission_classes([AllowAny])
def get_categories(request):
    try:
        print("📌 Fetching categories...")  # ✅ Debug log
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        
        print(f"✅ {len(serializer.data)} categories found.")  # ✅ Print number of categories
        return JsonResponse(serializer.data, safe=False)
    
    except Exception as e:
        print(f"❌ Error fetching categories: {e}")  # ✅ Print error in terminal
        return JsonResponse({"error": "Failed to fetch categories"}, status=500)


@api_view(["GET"])
@permission_classes([AllowAny])
def get_products_by_category(request):
    category_name = request.GET.get("category", None)  # ✅ Read category name from query

    if not category_name or category_name.lower() == "all":  
        # ✅ Show all products if no category or "all"
        products = Product.objects.all()
    else:
        try:
            category = Category.objects.get(name__iexact=category_name)  # ✅ Case-insensitive match
            products = Product.objects.filter(category=category)
        except Category.DoesNotExist:
            return JsonResponse({"error": "Category not found"}, status=404)

    product_list = [
        {
            "id": product.id,
            "name": product.name,
            "price": product.price,
            "image": product.image.url if product.image else "",
            "category": product.category.name,  # ✅ Include category name
        }
        for product in products
    ]

    return JsonResponse({"products": product_list})


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from datetime import datetime
from .models import Product
import logging

logger = logging.getLogger(__name__)

@api_view(["POST"])
@permission_classes([AllowAny])
def upload_products(request):
    # Expecting JSON payload with a "data" key containing a list of product dictionaries
    product_data = request.data.get("data")
    if not product_data:
        return Response({"error": "No data provided"}, status=400)

    try:
        for row in product_data:
            try:
                expiry_date = None
                if row.get("Expiry Date"):
                    try:
                        expiry_date = datetime.strptime(row["Expiry Date"], "%d/%m/%Y").date()
                    except Exception as e:
                        logger.error(f"Error parsing expiry date for row {row}: {e}")
                        expiry_date = None

                defaults = {
                    "name": row.get("Name", ""),
                    "description": row.get("Description", ""),
                    "price": float(row["Price"]) if row.get("Price") not in [None, ""] else 0.0,
                    "stock_quantity": int(row["Stock Quantity"]) if row.get("Stock Quantity") not in [None, ""] else 0,
                    "brand": row.get("Brand", ""),
                    "color": row.get("Color") or None,
                    "size": row.get("Size") or None,
                    "availability": True if str(row.get("Availability")).strip() in ["1", "True", "true"] else False,
                    "rating": float(row["Rating"]) if row.get("Rating") not in [None, ""] else None,
                    "reviews": int(row["Reviews"]) if row.get("Reviews") not in [None, ""] else 0,
                    "expiry_date": expiry_date,
                    "shipping_cost": float(row["Shipping Cost"]) if row.get("Shipping Cost") not in [None, ""] else 0.0,
                    "seller_name": row.get("Seller Name", ""),
                    "seller_rating": float(row["Seller Rating"]) if row.get("Seller Rating") not in [None, ""] else None,
                    "image": row.get("Image Path", ""),
                    "category_id": int(row["Category ID"]) if row.get("Category ID") not in [None, ""] else 0,
                }

                # Use update_or_create: if a product with the given ID exists, update it; otherwise, create a new one.
                Product.objects.update_or_create(
                    id=int(row["ID"]),
                    defaults=defaults
                )
            except Exception as inner_error:
                logger.error(f"Error processing row {row}: {inner_error}")
                continue

        return Response({"message": "Products uploaded successfully!"})
    except Exception as e:
        logger.error(f"Error in bulk upload: {e}")
        return Response({"error": str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_orders(request):
    orders = Order.objects.all().order_by('-id')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)