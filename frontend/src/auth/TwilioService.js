import axios from 'axios';

export const sendOTP = async (phoneNumber) => {
  try {
    const response = await axios.post('/api/send-otp/', { phone_number: phoneNumber });
    return response.data;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

export const verifyOTP = async (phoneNumber, otp) => {
  try {
    const response = await axios.post('/api/verify-otp/', { phone_number: phoneNumber, otp });
    return response.data;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};
