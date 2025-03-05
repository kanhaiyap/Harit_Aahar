import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,  // ✅ Use dynamic API URL
  withCredentials: true,  // ✅ Ensure cookies & sessions are sent
  headers: {
    "Content-Type": "application/json",
  },
});
axiosInstance.interceptors.request.use(
  async (config) => {
    const csrfToken = await getCSRFToken();
    if (csrfToken) {
      config.headers["X-CSRFToken"] = csrfToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
console.log("✅ API BASE URL:", API_BASE_URL);
export const getCSRFToken = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/csrf1/`, {
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

    const response = await axiosInstance.post("/api/auth/send-otp/",
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
    const response = await axiosInstance.post("/api/auth/verify-otp/",
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

    const response = await axiosInstance.post(
      `/api/auth/signup/`,
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
    const response = await axiosInstance.get("/api/auth/profile/", {
      headers: { Authorization: `Token ${getAuthToken()}` },
    });
    return response.data.is_staff; // Ensure backend sends is_staff
  } catch (error) {
    return false;
  }
};

export default axiosInstance;