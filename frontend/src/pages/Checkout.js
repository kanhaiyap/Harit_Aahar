import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getCSRFToken } from '../auth/AuthUtils';

const API_BASE_URL = process.env.REACT_APP_API_URL;
console.log("🔹 API Base URL:", API_BASE_URL);

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [addresses, setAddresses] = useState([]);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchUserProfile();
    fetchCartItems();
  }, [location]);

  // ✅ Fetch user details and addresses from API
  const fetchUserProfile = async () => {
    try {
      const csrfToken = await getCSRFToken();
      const authToken = localStorage.getItem("authToken");

      const response = await axios.get(`${API_BASE_URL}/api/auth/profile/`,  {
        headers: {
          "X-CSRFToken": csrfToken,
          "Authorization": authToken ? `Token ${authToken}` : "",
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      console.log("✅ User Profile:", response.data);
      setUserInfo(response.data);
      setAddresses(response.data.addresses || []);

      // ✅ Set the selected address from the cart
      const queryParams = new URLSearchParams(location.search);
      const addressId = queryParams.get('address_id');
      if (addressId) {
        const selectedAddr = response.data.addresses.find(addr => addr.id.toString() === addressId);
        setSelectedAddress(selectedAddr || null);
      }
    } catch (error) {
      console.error("🚨 Error fetching user profile:", error.response?.data || error);
      alert("❌ Failed to load profile. Redirecting to login...");
      navigate("/login");
    }
  };

  // ✅ Load cart items
  const fetchCartItems = () => {
    const storedCartItems = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(storedCartItems);
    console.log("🖼️ Cart Items:", storedCartItems);
    const total = storedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotalPrice(total);
  };
 

  const handlePayment = async () => {
    try {
      const csrfToken = await getCSRFToken();
      const authToken = localStorage.getItem("authToken");
  
      const response = await axios.post(
        `${API_BASE_URL}/api/create_razorpay_order/`, 
        { amount: totalPrice },
        {
          headers: {
            "X-CSRFToken": csrfToken,  
            "Authorization": authToken ? `Token ${authToken}` : "",
            "Content-Type": "application/json",
          },
          withCredentials: true, 
        }
      );
  
      const { order_id, key, amount } = response.data;
  
      if (typeof window.Razorpay === "undefined") {
        alert("Razorpay SDK failed to load. Please check your internet connection and try again.");
        return;
      }
  
      const options = {
        key: key,
        amount: amount,
        currency: "INR",
        name: "Harit Aahar",
        description: "Payment for your order",
        order_id: order_id,
        handler: async function (response) {
          const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;
  
          try {
            const verifyResponse = await axios.post(
              `${API_BASE_URL}/api/verify_payment/`,
              { razorpay_payment_id, razorpay_order_id, razorpay_signature },
              {
                headers: {
                  "X-CSRFToken": csrfToken, 
                  "Authorization": authToken ? `Token ${authToken}` : "", 
                  "Content-Type": "application/json",
                },
                withCredentials: true,
              }
            );
  
            if (verifyResponse.data.status === "success") {
              alert("Payment successful and verified!");
              localStorage.removeItem("cart");
              navigate("/");
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch (error) {
            console.error("Error verifying payment:", error);
            alert("An error occurred during payment verification.");
          }
        },
        prefill: {
          name: userInfo?.name || "",
          email: userInfo?.email || "",
          contact: userInfo?.phone || "",
        },
        notes: {
          address: selectedAddress ? `${selectedAddress.address_line1}, ${selectedAddress.city}` : "",
        },
        theme: {
          color: "#28a745",
        },
      };
  
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("🚨 Error during payment:", error.response?.data || error);
      alert("Payment initiation failed. Please try again.");
    }
  };
  
  
    
  
  

  return (
    <div>
      <h1>Checkout</h1>

      {/* ✅ Display User Information */}
      <div style={styles.section}>
        <h2>User Information</h2>
        {userInfo ? (
          <>
            <p><strong>Name:</strong> {userInfo.name}</p>
            <p><strong>Phone:</strong> {userInfo.phone_number}</p>
            <p><strong>Email:</strong> {userInfo.email}</p>
          </>
        ) : (
          <p>Loading user details...</p>
        )}
      </div>

      {/* ✅ Delivery Address Selection */}
      <div style={styles.section}>
        <h2>Delivery Address</h2>
        {addresses.length > 0 ? (
          <ul style={styles.addressList}>
            {addresses.map((address) => (
              <li key={address.id} style={{ ...styles.addressItem, backgroundColor: selectedAddress?.id === address.id ? '#d4edda' : 'white' }}>
                <input
                  type="radio"
                  name="address"
                  value={address.id}
                  checked={selectedAddress?.id === address.id}
                  onChange={() => setSelectedAddress(address)}
                />
                <strong>{address.address_line1}</strong>, {address.city} - {address.postal_code}
              </li>
            ))}
          </ul>
        ) : (
          <p>No addresses found. <a href="/cart">Go back to cart</a> and add an address.</p>
        )}
      </div>

      {/* ✅ Order Summary */}
      <div style={styles.section}>
        <h2>Order Summary</h2>
        {cartItems.length > 0 ? (
          <ul style={styles.cartList}>
            {cartItems.map((item, index) => (
              <li key={index} style={styles.cartItem}>
                <img src={item.image || "/images/products/default.jpg"} alt={item.name} style={styles.productImage} />
                <div>
                  <p><strong>{item.name}</strong></p>
                  <p>Price: ₹{item.price}</p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Total: ₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>Your cart is empty.</p>
        )}
      </div>

      {/* ✅ Total Price and Place Order Button */}
      <div style={styles.section}>
        <h2>Total Price: ₹{totalPrice.toFixed(2)}</h2>
        <button onClick={handlePayment} style={styles.placeOrderButton}>Place Order</button>
      </div>
    </div>
  );
};

export default Checkout;

const styles = {
  section: {
    marginBottom: '30px',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
  },
  addressList: {
    listStyle: 'none',
    padding: 0,
  },
  addressItem: {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    marginBottom: '10px',
    cursor: 'pointer',
  },
  cartList: {
    listStyle: 'none',
    padding: 0,
  },
  cartItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '15px',
  },
  productImage: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    marginRight: '20px',
    borderRadius: '5px',
  },
  placeOrderButton: {
    padding: '12px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    fontSize: '16px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};
