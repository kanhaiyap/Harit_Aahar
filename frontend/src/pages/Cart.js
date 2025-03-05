import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getCSRFToken } from '../auth/AuthUtils';
import axiosInstance from "../auth/AuthUtils";
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://3.87.160.209:8000"; 


const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [profile, setProfile] = useState(null); // ✅ Store user details
  const [addresses, setAddresses] = useState([]); // ✅ Store addresses from API
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [editingAddress, setEditingAddress] = useState(null); // ✅ Store editing address
  const navigate = useNavigate();

  useEffect(() => {
    loadCartItems();
    fetchProfile(); // ✅ Fetch user details and addresses
  }, []);

  // ✅ Load Cart Items from Local Storage
  const loadCartItems = () => {
    const storedCartItems = JSON.parse(localStorage.getItem("cart")) || [];
    console.log("🔹 Cart Items (Before Fix):", storedCartItems);
  
    const updatedCartItems = storedCartItems.map((item) => {
      let imagePath = item.image;
  
      // ✅ Strip API_BASE_URL if it's present
      if (imagePath.startsWith(API_BASE_URL)) {
        imagePath = imagePath.replace(API_BASE_URL, ""); // Remove full URL
      }
  
      // ✅ Ensure image follows the correct relative path format: /images/products/Apple.jpg
      if (!imagePath.startsWith("/images/products/")) {
        const formattedName = item.name.replace(/\s+/g, "").trim(); // ✅ Remove spaces
        imagePath = `/images/products/${formattedName}.jpg`; // ✅ Final correct format
      }
  
      return {
        ...item,
        image: imagePath, // ✅ Save the correct relative path
      };
    });
  
    console.log("✅ Cart Items (After Fix):", updatedCartItems);
    setCartItems(updatedCartItems);
  
    // ✅ Overwrite localStorage with fixed image paths
    localStorage.setItem("cart", JSON.stringify(updatedCartItems));
  
    const total = updatedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotalPrice(total);
  };
  
  // ✅ Fetch User Profile and Addresses
  const fetchProfile = async () => {
    console.log("🔄 Fetching profile...");
    try {
      const csrfToken = await getCSRFToken();
      const authToken = localStorage.getItem("authToken");

      const response = await axiosInstance.get(`/api/auth/profile/`, {
        withCredentials: true,
        headers: {
          "X-CSRFToken": csrfToken,
          "Authorization": authToken ? `Token ${authToken}` : "",
          "Content-Type": "application/json",
        },
      });

      console.log("✅ Profile Data:", response.data);

      // ✅ Store profile data (excluding orders)
      setProfile({
        name: response.data.name || "Unknown",
        email: response.data.email || "No email available",
        phone: response.data.phone_number || "No phone available",
      });

      // ✅ Store addresses
      setAddresses(response.data.addresses || []);
      if (response.data.addresses.length > 0) {
        setSelectedAddress(response.data.addresses[0].id);
      }
    } catch (error) {
      console.error("🚨 Error fetching profile:", error.response?.data || error);
      alert("Error loading profile. Please check authentication.");
      setProfile(null);
      setAddresses([]); // Ensure addresses is an array to avoid `.map()` errors
    }
  };

  // ✅ Handle Address Selection
  const handleAddressChange = (e) => {
    setSelectedAddress(e.target.value);
  };

  // ✅ Enable Address Editing
  const startEditing = (address) => {
    setEditingAddress({ ...address });
  };

  // ✅ Handle Address Input Change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const saveEditedAddress = async () => {
    if (!editingAddress) return;
  
    try {
      const csrfToken = await getCSRFToken();
      const authToken = localStorage.getItem("authToken");
  
      const response = await axios.put(
        `/api/auth/update-address/${editingAddress.id}/`,
        editingAddress,
        {
          headers: {
            "X-CSRFToken": csrfToken,
            "Authorization": authToken ? `Token ${authToken}` : "",
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
  
      console.log("✅ Address Updated:", response.data);
  
      // ✅ Update address in frontend state after successful API update
      const updatedAddresses = addresses.map((addr) =>
        addr.id === editingAddress.id ? editingAddress : addr
      );
      setAddresses(updatedAddresses);
  
      setEditingAddress(null);
      alert("✅ Address updated successfully!");
    } catch (error) {
      console.error("🚨 Error updating address:", error.response?.data || error);
      alert("❌ Failed to update address. Try again.");
    }
  };


  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return; // ✅ Prevent negative quantity
  
    let updatedCart = cartItems.map((item) =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
  
    localStorage.setItem("cart", JSON.stringify(updatedCart)); // ✅ Update `localStorage`
    setCartItems(updatedCart);
  };
  
  const removeFromCart = (productId) => {
    let updatedCart = cartItems.filter((item) => item.id !== productId);
  
    localStorage.setItem("cart", JSON.stringify(updatedCart)); // ✅ Update `localStorage`
    setCartItems(updatedCart);
  };
  const buttonStyle = {
    margin: "0 5px",
    padding: "5px 10px",
    fontSize: "16px",
    cursor: "pointer",
    border: "1px solid #ccc",
    backgroundColor: "#f8f8f8",
    borderRadius: "5px",
  };
  
  const removeButtonStyle = {
    marginTop: "10px",
    padding: "5px 15px",
    fontSize: "16px",
    backgroundColor: "#ff4d4d",
    color: "white",
    border: "none",
    cursor: "pointer",
    borderRadius: "5px",
  };
  
  return (
    <div>
      <h1>Your Cart</h1>

      {/* ✅ User Details (Without Orders) */}
      {profile ? (
        <div>
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Phone:</strong> {profile.phone}</p>
        </div>
      ) : (
        <p>Loading user details...</p>
      )}

      {/* ✅ Cart Items */}
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
         {cartItems.map((item, index) => (
  <div key={index} className="cart-item" style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
    <img 
      src={item.image || "/images/products/Default.jpg"} // ✅ Same logic as Checkout.js
      alt={item.name || "Product"} 
      width="100" 
      height="100" 
      style={{ marginRight: '20px', objectFit: 'cover' }} 
      onError={(e) => { 
        }} 
    />
     {/* ✅ Add Quantity Controls */}
     <p>
            Quantity:
            <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
            {item.quantity}
            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
            <button onClick={() => removeFromCart(item.id)} style={removeButtonStyle}>
            Remove
          </button>

          </p>
    <div style={{ flexGrow: 1 }}>
      <h3>{item.name || `Product ${item.id}`}</h3>
      <p>Price: ₹{item.price}</p>
      <p>Quantity: {item.quantity}</p>
      <p>Total: ₹{(item.price * item.quantity).toFixed(2)}</p>
    </div>
  </div>
))}




          <p><strong>Total Price: ₹{totalPrice.toFixed(2)}</strong></p>
          <button onClick={() => navigate(`/checkout?total_price=${totalPrice}&address_id=${selectedAddress}`)} className="btn btn-success">Checkout</button>
        </div>
      )}

      {/* ✅ Address Selection */}
      <h2>Select Address for Delivery</h2>
      {addresses.length > 0 ? (
        <select value={selectedAddress || ''} onChange={handleAddressChange} id="address-select">
          {addresses.map((address) => (
            <option key={address.id} value={address.id}>
              {address.address_line1}, {address.city}, {address.state} - {address.postal_code}
            </option>
          ))}
        </select>
      ) : (
        <p>No saved addresses. <button onClick={() => navigate("/add-address")}>Add Address</button></p>
      )}

      {/* ✅ Address Editing Section */}
      <h2>Edit Address</h2>
      {editingAddress ? (
        <div>
          <input
            type="text"
            name="address_line1"
            placeholder="Address Line 1"
            value={editingAddress.address_line1}
            onChange={handleEditChange}
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={editingAddress.city}
            onChange={handleEditChange}
          />
          <input
            type="text"
            name="state"
            placeholder="State"
            value={editingAddress.state}
            onChange={handleEditChange}
          />
          <input
            type="text"
            name="postal_code"
            placeholder="Postal Code"
            value={editingAddress.postal_code}
            onChange={handleEditChange}
          />
          <button onClick={saveEditedAddress}>Save Changes</button>
          <button onClick={() => setEditingAddress(null)}>Cancel</button>
        </div>
      ) : (
        addresses.length > 0 && (
          <button onClick={() => startEditing(addresses[0])}>Edit Address</button>
        )
      )}
    </div>
  );
};

export default Cart;
