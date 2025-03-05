import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

export const sendOTP = async (phoneNumber) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/send-otp/`,
     { phone_number: phoneNumber });
    return response.data;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

export const verifyOTP = async (phoneNumber, otp) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/verify-otp/`,
    { phone_number: phoneNumber, otp });
    return response.data;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};
