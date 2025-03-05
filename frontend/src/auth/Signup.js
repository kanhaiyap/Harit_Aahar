import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 

import { sendOTP, verifyOTP, getCSRFToken } from '../auth/AuthUtils';
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
const Signup = () => {
  const [userInfo, setUserInfo] = useState({ name: '', phone: '', email: '', password: '' });
  const [otp, setOTP] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null); 
  const navigate = useNavigate(); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  const handleSendOTP = async () => {
    try {
      const response = await sendOTP(userInfo.phone);
      if (response.success) {
        alert('OTP sent successfully!');
        setOtpSent(true);
      } else {
        alert('Failed to send OTP');
      }
    } catch (error) {
      alert('Error sending OTP');
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const response = await verifyOTP(userInfo.phone, otp);
      if (response.success) {
        alert('OTP verified successfully!');
        setVerified(true);
      } else {
        alert('Invalid OTP');
      }
    } catch (error) {
      alert('Error verifying OTP');
    }
  };

  const handleSignup = async () => {
    console.log('🚀 Signup button clicked! Attempting to call API...');
    
  
    if (!verified) {
      alert('⚠️ Please verify your OTP first.');
      return;
    }
  
    console.log('✅ Proceeding with signup:', userInfo);
  
    const csrfToken = await getCSRFToken();
    if (!csrfToken) {
      console.error('❌ CSRF Token is missing. Ensure backend sends CSRF cookie.');
      alert('CSRF Token missing. Please refresh and try again.');
      return;
    }
  
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/signup/`, 
        {
          name: userInfo.name,  // Must match backend (username in Django)
          phone: userInfo.phone,  // Must match backend (phone_number in Django)
          email: userInfo.email,
          password: userInfo.password,
        }, 
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
          },
          withCredentials: true,
        }
      );
  
      console.log('🎉 API Response:', response.data);
  
      if (response.data.success) {
        
        alert('✅ Signup successful! Redirecting to products...');
        navigate('/products'); 
       

      } else {
        setErrorMessage(response.data.message); 
      }
    } catch (error) {
      console.error('🔥 API request failed:', error.response?.data || error);
      setErrorMessage(error.response?.data.message || '❌ Error during signup. Check console.');
    
    }
  };

  



  
  return (
    <div className="form-container">
      <h2>Signup</h2>
      {errorMessage && (
        <div className="error-message">
          ❌ {errorMessage}
          {errorMessage.includes('already exists') && (
            <button onClick={() => navigate('/login')} className="redirect-btn">
              Go to Login
            </button>
          )}
        </div>
      )}
      
      <input type="text" name="name" placeholder="Name" value={userInfo.name} onChange={handleChange} required />
      <input type="email" name="email" placeholder="Email" value={userInfo.email} onChange={handleChange} required />
      <input type="tel" name="phone" placeholder="Phone Number" value={userInfo.phone} onChange={handleChange} required />
      <input type="password" name="password" placeholder="Password" value={userInfo.password} onChange={handleChange} required />
      
      {!otpSent ? (
        <button onClick={handleSendOTP}>Send OTP</button>
      ) : (
        <>
          <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOTP(e.target.value)} required />
          <button onClick={handleVerifyOTP}>Verify OTP</button>
        </>
      )}

      <button onClick={handleSignup} disabled={!verified}>Signup</button>
    </div>
  );
};

export default Signup;
