import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyOTP } from './TwilioService';

const OTPVerification = () => {
  const [otp, setOtp] = useState('');
  const { state } = useLocation();
  const navigate = useNavigate();

  const handleVerifyOTP = async () => {
    try {
      const response = await verifyOTP(state.phoneNumber, otp);
      if (response.success) {
        alert('Login successful!');
        navigate('/'); // Redirect to homepage
      } else {
        alert('Invalid OTP. Please try again.');
      }
    } catch (error) {
      alert('Failed to verify OTP. Please try again.');
    }
  };

  return (
    <div>
      <h2>Enter OTP</h2>
      <input 
        type="text" 
        placeholder="Enter OTP" 
        value={otp} 
        onChange={(e) => setOtp(e.target.value)} 
      />
      <button onClick={handleVerifyOTP}>Verify OTP</button>
    </div>
  );
};

export default OTPVerification;
