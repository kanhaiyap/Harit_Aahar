import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getCSRFToken } from "../auth/AuthUtils";
const Profile = () => {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    console.log("🔄 Fetching profile...");

    try {
      const csrfToken = await getCSRFToken();  // Ensure CSRF Token is awaited
      const authToken = localStorage.getItem("authToken"); 
      console.log("✅ CSRF Token:", csrfToken);
      console.log("✅ CSRF Token:", authToken);

      const response = await axios.get("/api/auth/profile/", {
      withCredentials: true,  
      headers: {
        "X-CSRFToken": csrfToken,  // CSRF token
        "Authorization": authToken ? `Token ${authToken}` : "",  // Auth token if available
        "Content-Type": "application/json",

        },
        
      });

      console.log("✅ Profile Data:", response.data);
      setProfile(response.data);
    } catch (error) {
      console.error("🚨 Error fetching profile:", error.response?.data || error);
      alert("Error loading profile. Redirecting to login...");
      navigate("/login");  // Redirect to login if unauthorized
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("storage")); // notify other components if needed
    navigate("/login");
  };

  

  return (
    <div>
      <h1>User Profile</h1>
      {profile ? (
        <div>
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Phone:</strong> {profile.phone_number}</p>

          <h2>Orders</h2>
          {profile.orders.length > 0 ? (
            <ul>
              {profile.orders.map((order) => (
                <li key={order.id}>
                  <p><strong>Order ID:</strong> {order.id}</p>
                  <p><strong>Amount:</strong> ₹{order.total_amount}</p>
                  <p><strong>Status:</strong> {order.status}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No orders found.</p>
          )}

<h3>Addresses</h3>
{profile.addresses && profile.addresses.length > 0 ? (
  <ul>
    {profile.addresses.map((address) => (
      <li key={address.id}>
        {address.address_line1}, {address.address_line2}, {address.city}, {address.state}, {address.country} - {address.postal_code}
         <button onClick={handleLogout}>Logout</button>

      </li>
    ))}
  </ul>
) : (
  <p>No addresses found. <button onClick={() => navigate("/add-address")}>Add Address</button></p>
)}

        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
};

export default Profile;

