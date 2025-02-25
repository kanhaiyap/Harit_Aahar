// import axios from "axios";
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { getCSRFToken } from "../auth/AuthUtils"; // ✅ Ensure this is imported

// const Login = () => {
//   const [userInfo, setUserInfo] = useState({ email: "", password: "" });
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setUserInfo({ ...userInfo, [name]: value });
//   };

//   const handleLogin = async () => {
//     console.log("🚀 Attempting login...");
//     console.log("📌 Sending Login Data:", userInfo); // ✅ Debugging

//     if (!userInfo.email || !userInfo.password) {
//       alert("❌ Please enter both email/phone and password.");
//       return;
//     }

//     try {
//       const csrfToken = await getCSRFToken(); // ✅ Fetch CSRF token first
//       console.log("✅ CSRF Token:", csrfToken);

//       if (!csrfToken) {
//         alert("❌ CSRF Token missing. Refresh the page and try again.");
//         return;
//       }

//       const response = await axios.post(
//         "http://127.0.0.1:8000/api/auth/login/",
//         {
//           username: userInfo.email, // ✅ Backend expects "username"
//           password: userInfo.password,
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//             "X-CSRFToken": csrfToken, // ✅ Send CSRF token
//           },
//           withCredentials: true, // ✅ Allows session cookies
//         }
//       );

//       console.log("🎉 Login Success:", response.data);
//       if (response.data.success) {
//         const userData = {
//           name: response.data.user.name,
//           email: response.data.user.email,
//           phone_number: response.data.user.phone_number,
//         };
//         localStorage.setItem("authToken", response.data.authToken);
//         alert("✅ Login successful!");
//         localStorage.setItem("user", JSON.stringify(userData)); // ✅ Store full user data
//       window.dispatchEvent(new Event("storage")); // ✅ Notify Layout.js of login


//         navigate("/profile"); // Redirect to profile page
//       } else {
//         alert("❌ Login failed: " + response.data.message);
//       }
//     } catch (error) {
//       console.error("🔥 Login Error:", error.response?.data || error);
//       alert("❌ Login failed. Check console for details.");
//     }
//   };

//   return (
//     <div>
//       <h2>Login</h2>
//       <input type="text" name="email" placeholder="Email or Phone" value={userInfo.email} onChange={handleChange} />
//       <input type="password" name="password" placeholder="Password" value={userInfo.password} onChange={handleChange} />
//       <button onClick={handleLogin}>Login</button>
//       <button onClick={() => navigate('/signup')}>Signup</button>
//       <button onClick={() => navigate('/forgot-password')}>Forgot Password?</button>
    
//     </div>
//   );
// };

// export default Login;






import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getCSRFToken, sendOTP, verifyOTP } from '../auth/AuthUtils';

// Ensure axios sends cookies with every request globally.
axios.defaults.withCredentials = true;

const Login = () => {
  const [userInfo, setUserInfo] = useState({ phone: '', password: '' });
  const [otp, setOTP] = useState('');
  // stage: 'credentials' (initial) or 'otp' (OTP sent & awaiting verification)
  const [stage, setStage] = useState('credentials');
  const [csrfToken, setCsrfToken] = useState(null);
  const navigate = useNavigate();

  // Prefetch CSRF cookie on mount.
  useEffect(() => {
    const fetchCsrf = async () => {
      const token = await getCSRFToken();
      setCsrfToken(token);
      console.log("Prefetched CSRF Token:", token);
    };
    fetchCsrf();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
  };

  // Step 1: Check credentials via the regular login endpoint.
  // If valid, automatically send OTP.
  const handleSendOTP = async () => {
    if (!userInfo.phone || !userInfo.password) {
      alert("Please enter both phone number and password.");
      return;
    }
    if (!csrfToken) {
      alert("CSRF Token not available. Please refresh the page.");
      return;
    }
    try {
      // Check credentials.
      const credResponse = await axios.post(
        "http://127.0.0.1:8000/api/auth/login/",
        {
          username: userInfo.phone,
          password: userInfo.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
        }
      );
      if (!credResponse.data.success) {
        alert("Incorrect phone number or password. Please enter the correct password.");
        return;
      }
      // Credentials valid; now send OTP.
      const otpResponse = await sendOTP(userInfo.phone);
      if (otpResponse.success) {
        alert("✅ OTP sent successfully!");
        setStage('otp');
      } else {
        alert("❌ Failed to send OTP: " + otpResponse.message);
      }
    } catch (error) {
      console.error("Error during credential check or sending OTP:", error.response?.data || error);
      alert("Error during credential check or sending OTP. Check console for details.");
    }
  };

  // Step 2: Verify OTP and complete login.
  // We call the same login endpoint and include the OTP in the payload.
  const handleOTPLogin = async () => {
    if (!otp) {
      alert("Please enter the OTP.");
      return;
    }
    if (!csrfToken) {
      alert("CSRF Token not available. Please refresh the page.");
      return;
    }
    try {
      // First, verify the OTP.
      const verifyResponse = await verifyOTP(userInfo.phone, otp);
      if (!verifyResponse.success) {
        alert("Invalid OTP. Please try again.");
        return;
      }
      // OTP verified; now complete login.
      const loginResponse = await axios.post(
        "http://127.0.0.1:8000/api/auth/login/",
        {
          username: userInfo.phone,
          password: userInfo.password,
          otp: otp, // Pass OTP so backend can handle it accordingly
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
        }
      );
      if (loginResponse.data.success) {
        const userData = {
          name: loginResponse.data.user.name,
          phone: loginResponse.data.user.phone_number,
        };
        localStorage.setItem("authToken", loginResponse.data.authToken);
        localStorage.setItem("user", JSON.stringify(userData));
        window.dispatchEvent(new Event("storage"));
        alert("✅ Login successful!");
        navigate("/profile");
      } else {
        alert("❌ Login failed: " + loginResponse.data.message);
      }
    } catch (error) {
      console.error("Error during OTP login:", error.response?.data || error);
      alert("Error during OTP login. Check console for details.");
    }
  };

  // Single button handler: if stage is 'credentials', check credentials and send OTP;
  // if stage is 'otp', verify OTP and complete login.
  const handleButtonClick = async () => {
    if (stage === 'credentials') {
      await handleSendOTP();
    } else if (stage === 'otp') {
      await handleOTPLogin();
    }
  };

  const buttonText = stage === 'credentials' ? "Send OTP" : "Login";

  return (
    <div className="form-container">
      <h2>Login</h2>
      <input 
        type="tel" 
        name="phone" 
        placeholder="Enter your phone number" 
        value={userInfo.phone} 
        onChange={handleChange} 
        required 
      />
      <input 
        type="password" 
        name="password" 
        placeholder="Enter your password" 
        value={userInfo.password} 
        onChange={handleChange} 
        required 
      />
      {stage === 'otp' && (
        <input 
          type="text" 
          placeholder="Enter OTP" 
          value={otp} 
          onChange={(e) => setOTP(e.target.value)} 
          required 
        />
      )}
      <button onClick={handleButtonClick}>{buttonText}</button>
      <button onClick={() => navigate('/signup')}>Signup</button>
      <button onClick={() => navigate('/forgot-password')}>Forgot Password?</button>
    </div>
  );
};

export default Login;
