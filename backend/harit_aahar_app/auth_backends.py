from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()

class EmailOrPhoneBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        print(f"📌 DEBUG: Authenticating user={username} with password={password}")

        try:
            # ✅ Try to get user by email
            user = User.objects.filter(email=username).first()
            if not user:
                # ✅ Try to get user by phone
                user = User.objects.filter(phone_number=username).first()

            if user and user.check_password(password):
                print(f"✅ DEBUG: Authentication successful for {user.email}")
                return user
            else:
                print("❌ DEBUG: Authentication failed (Invalid password)")
                return None

        except Exception as e:
            print(f"🔥 DEBUG: Error during authentication - {e}")
            return None
