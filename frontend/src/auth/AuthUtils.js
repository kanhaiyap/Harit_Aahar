import axios from 'axios';

export const getCSRFToken = async () => {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/auth/csrf1/", {
      method: "GET",
      credentials: "include",  // ✅ Ensure cookies are sent
    });

    if (!response.ok) throw new Error(`CSRF fetch error: ${response.status}`);

    const data = await response.json();
    console.log("✅ CSRF Token Retrieved:", data.csrfToken);  // ✅ Debugging log

    return data.csrfToken;
  } catch (error) {
    console.error("❌ Error fetching CSRF Token:", error);
    return null;
  }
};







// ✅ Function to send OTP
export const sendOTP = async (phoneNumber) => {
  try {
    const csrfToken = await getCSRFToken(); // Fetch CSRF Token before sending request

    const response = await axios.post(
      '/api/auth/send-otp/',
      { phone_number: phoneNumber },
      {
        headers: {
          'X-CSRFToken': csrfToken,  // Send CSRF Token in header
          'Content-Type': 'application/json',
        },
        withCredentials: true,  // Allow cookies for CSRF
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error sending OTP:', error.response || error);
    throw error;
  }
};


export const verifyOTP = async (phoneNumber, otp) => {
  const csrfToken = await getCSRFToken();  // ✅ Ensure CSRF token is set
  if (!csrfToken) {
    alert("⚠️ CSRF Token missing! Try again.");
    return;
  }

  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/api/auth/verify-otp/",
      { phone_number: phoneNumber, otp: otp }, // ✅ Send phone_number in request
      {
        headers: {
          "X-CSRFToken": csrfToken,
        },
        withCredentials: true, // ✅ Ensure cookies are sent
      }
    );

    console.log("✅ OTP Verified Successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("🔥 OTP Verification Failed:", error.response?.data || error);
    alert("❌ OTP Verification Failed. Check console for details.");
    throw error;
  }
};

// Signup Function
export const signupUser = async (userInfo) => {
  try {
    const csrfToken = await getCSRFToken();
    if (!csrfToken) {
      throw new Error('CSRF Token missing. Try reloading the page.');
    }

    console.log('Sending signup request with:', userInfo);  // Log data before request

    const response = await axios.post(
      '/api/auth/signup/',
      userInfo,
      {
        headers: {
          'X-CSRFToken': csrfToken,
        },
        withCredentials: true,
      }
    );

    console.log('Signup API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error during signup:', error.response?.data || error);
    throw error;
  }
};




export const getAuthToken = () => localStorage.getItem("authToken");

export const isStaffUser = async () => {
  try {
    const response = await axios.get("http://127.0.0.1:8000/api/auth/profile/", {
      headers: { Authorization: `Token ${getAuthToken()}` },
    });
    return response.data.is_staff; // Ensure backend sends is_staff
  } catch (error) {
    return false;
  }
};