from django.urls import path, include,re_path
from django.views.generic import TemplateView
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static
from . import views
from .views import (
    ProductViewSet, OrderViewSet, PaymentViewSet, CategoryViewSet, AddressViewSet,
    AddToCartView, CartView, CreateOrderView, VerifyPaymentView, LoginView, ContactView,
CreateRazorpayOrder, VerifyPaymentView, SendOTPView, VerifyOTPView, get_csrf_token, SignupView
, get_profile, get_user_orders, get_user_addresses, reset_password, update_address, 
category_list, order_item_list, shipping_list, get_inventory_logs, 
admin_login,get_csrf_token1, upload_products, get_category_products, category_list, upload_csv,  get_categories, get_products_by_category
, get_orders)


router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')



router.register(r'orders', OrderViewSet)
router.register(r'payments', PaymentViewSet)
# router.register(r'categories', CategoryViewSet)
router.register(r'addresses', AddressViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/cart/', CartView.as_view(), name='cart'),
    path('api/cart/add/<int:product_id>/', AddToCartView.as_view(), name='add_to_cart'),
    path('api/create_order/', CreateOrderView.as_view(), name='create_order'),
    path('api/verify_payment/', VerifyPaymentView.as_view(), name='verify_payment'),
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/contact/', ContactView.as_view(), name='contact'),
        # Catch-all route to serve React
     path('api/products/', ProductViewSet.as_view({'get': 'list', 'post': 'create'}), name='product_list'),
    # path('api/products/update/', ProductViewSet.as_view({'put': 'update'}), name='product_update'),
    path('api/products/update/', ProductViewSet.as_view({'post': 'update_products'}), name='update-products'),
    path('api/create_razorpay_order/', CreateRazorpayOrder.as_view(), name='create_razorpay_order'),
    path('api/verify_payment/', VerifyPaymentView.as_view(), name='verify_payment'),
    path('api/auth/send-otp/', SendOTPView.as_view(), name='send_otp'),
    path('api/auth/verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
    path('api/auth/signup/', SignupView.as_view(), name='signup'),
    path('api/auth/reset-password/', reset_password, name='reset_password'),


     path('api/auth/profile/', get_profile, name='profile'),
    path('api/orders/', get_user_orders, name='user-orders'),
    path('api/addresses/', get_user_addresses, name='user-addresses'),
    path('staff/categories/', category_list, name='staff_categories'),
    path('staff/order-items/', order_item_list, name='staff_order_items'),
    path('staff/shipping/', shipping_list, name='staff_shipping'),

    
    path('api/get-csrf-token/', get_csrf_token),
    path('api/get-csrf-token1/', get_csrf_token1),
    path('api/auth/csrf/', get_csrf_token, name='get_csrf_token'),
    path('api/auth/csrf1/', get_csrf_token1, name='get_csrf_token1'),
    path('api/auth/update-address/<int:address_id>/', update_address, name='update_address'),

    path('api/admin/inventory/', get_inventory_logs, name="admin-inventory-logs"),
   path("api/admin/login/", admin_login, name="admin_login"),
    path("categories/<int:category_id>/products/", get_category_products, name="category-products"),
     path("api/admin/categories/", category_list, name="category-list"),
     path("api/admin/upload-csv/", upload_csv, name="upload-csv"),
      path("api/admin/orders/", get_orders, name="orders"),

      path("api/categories/", get_categories, name="get-categories"),
    path("api/products/", get_products_by_category, name="get-products-by-category"),
     path("api/admin/upload-products/", upload_products, name="upload-products"),

    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]



if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)