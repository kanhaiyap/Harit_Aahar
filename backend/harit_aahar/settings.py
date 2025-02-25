"""
Django settings for harit_aahar project.

Generated by 'django-admin startproject' using Django 5.1.6.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.1/ref/settings/
"""

from pathlib import Path


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "django-insecure-#d1@s@l9i8i=l@=+@^4m5mt1q6_*35^5&$&w4t$44g0p((a$g@"

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'harit_aahar_app',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]



CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",  # ✅ Vite Dev Server
    "http://127.0.0.1:5173",
    "http://3.87.160.209",
]
CORS_ALLOWED_ORIGINS = ['http://localhost:3000', 
                        'http://127.0.0.1:3000',
                        "http://localhost:5173",  # ✅ Vite Dev Server
                          "http://127.0.0.1:5173",
                          "http://3.87.160.209",
                          ]

# Allow all methods (GET, POST, etc.)
CORS_ALLOW_METHODS = [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
]

# Allow headers (important for CSRF)
CORS_ALLOW_HEADERS = [
    "accept",
    "authorization",
    "content-type",
    "x-csrftoken",
    "x-requested-with",
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',  # ✅ Uses Django session
        'rest_framework.authentication.TokenAuthentication',  # ✅ Allows token-based auth
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated', 
         'rest_framework.permissions.AllowAny', # ✅ Requires user to be logged in
    ],
}

# Allow credentials (for CSRF token)
CORS_ALLOW_CREDENTIALS = True
CSRF_COOKIE_HTTPONLY = False 
CSRF_COOKIE_NAME = "csrftoken"
CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SECURE = False

CSRF_COOKIE_DOMAIN = "localhost"  # ✅ Ensure CSRF cookie works with localhost
SESSION_COOKIE_DOMAIN = "localhost"


ROOT_URLCONF = "harit_aahar.urls"
import os
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [os.path.join(BASE_DIR, '..', 'frontend', 'build')],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

AUTHENTICATION_BACKENDS = [
    'harit_aahar_app.auth_backends.EmailOrPhoneBackend',
    'django.contrib.auth.backends.ModelBackend'
    ]

AUTH_USER_MODEL = 'harit_aahar_app.CustomUser'

WSGI_APPLICATION = "harit_aahar.wsgi.application"


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

import os

if os.getenv('DJANGO_ENV') == 'production':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME'),
            'USER': os.getenv('DB_USER'),
            'PASSWORD': os.getenv('DB_PASSWORD'),
            'HOST': os.getenv('DB_HOST'),
            'PORT': os.getenv('DB_PORT', '5432'),
            'OPTIONS': {
                'sslmode': 'require',
            },
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }



# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = "static/"

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"




# ✅ Allow credentials for cookies (important for CSRF)
CORS_ALLOW_CREDENTIALS = True
CSRF_COOKIE_HTTPONLY = False
CSRF_USE_SESSIONS = False
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_SECURE = False


STATIC_URL = '/static/'

STATICFILES_DIRS = [
    os.path.join(BASE_DIR,'..', 'frontend', 'build', 'static'),  # Adjust path if needed
]

STATIC_ROOT = BASE_DIR / "staticfiles"

# For Whitenoise to serve static files in production
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'


EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')  # Use environment variable
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')  # Use environment variable
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER


from decouple import config
from dotenv import load_dotenv
import os

load_dotenv()  # Load environment variables from .env


TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
TWILIO_WHATSAPP_FROM = os.getenv('TWILIO_WHATSAPP_FROM')
TWILIO_CONTENT_SID=os.getenv('TWILIO_CONTENT_SID')

SECRET_KEY = config('SECRET_KEY')
RAZORPAY_KEY_ID = config('RAZORPAY_KEY_ID', default=None)
RAZORPAY_SECRET_KEY = config('RAZORPAY_SECRET_KEY', default=None)
