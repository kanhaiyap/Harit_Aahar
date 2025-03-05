import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { sendOTP, verifyOTP, getCSRFToken } from '../auth/AuthUtils';
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
const ForgotPassword = () => {
  const navigate = useNavigate();
  const [userIdentifier, setUserIdentifier] = useState('');
  const [otp, setOTP] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Handle Input Change
  const handleChange = (e) => {
    setUserIdentifier(e.target.value);
  };
  const handleSendOTP = async () => {
    setLoading(true);
    console.log('🚀 Sending OTP request for:', userIdentifier);
  
    try {
      const csrfToken = getCSRFToken();
      console.log('✅ CSRF Token:', csrfToken); // Debugging CSRF Token
  
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/send-otp/`,
        { phone_number: userIdentifier },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
          },
          withCredentials: true,
        }
      );
  
      console.log('🎉 OTP Sent Response:', response.data);
  
      if (response.data.success) {
        alert('✅ OTP sent successfully!');
        setOtpSent(true);
      } else {
        alert('❌ Failed to send OTP: ' + response.data.message);
      }
    } catch (error) {
      console.error('🔥 Error sending OTP:', error.response?.data || error);
      alert('❌ Error sending OTP. Check console for details.');
    }
  
    setLoading(false);
  };
  
  // ✅ Verify OTP
  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      const response = await verifyOTP(userIdentifier, otp);
      if (response.success) {
        alert('✅ OTP verified successfully!');
        setVerified(true);
      } else {
        alert('❌ Invalid OTP');
      }
    } catch (error) {
      alert('❌ Error verifying OTP');
    }
    setLoading(false);
  };

  // ✅ Reset Password
  const handleResetPassword = async () => {
    if (!verified) {
      alert('⚠️ Please verify your OTP first.');
      return;
    }

    const csrfToken =await getCSRFToken();
    if (!csrfToken) {
      alert('❌ CSRF Token missing. Please refresh and try again.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/reset-password/`,
        {
          user_identifier: userIdentifier,
          new_password: newPassword,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        alert('✅ Password reset successful! Redirecting to login...');
        navigate('/login'); // ✅ Redirect to login page
      } else {
        alert('❌ Failed to reset password: ' + response.data.message);
      }
    } catch (error) {
      alert('❌ Error resetting password.');
    }
    setLoading(false);
  };

  return (
    <div className="form-container">
      <h2>Forgot Password</h2>

      {/* Step 1: Enter Email or Phone */}
      <input
        type="text"
        placeholder="Enter your email or phone number"
        value={userIdentifier}
        onChange={handleChange}
        required
      />

      {!otpSent ? (
        <button onClick={handleSendOTP} disabled={loading}>
          {loading ? 'Sending OTP...' : 'Send OTP'}
        </button>
      ) : (
        <>
          {/* Step 2: Enter OTP */}
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOTP(e.target.value)}
            required
          />
          <button onClick={handleVerifyOTP} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          {/* Step 3: Reset Password */}
          {verified && (
            <>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button onClick={handleResetPassword} disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </>
          )}
        </>
      )}

      {/* Link to login */}
      <p>
        Remembered your password? <a href="/login">Login</a>
      </p>
    </div>
  );
};

export default ForgotPassword;
