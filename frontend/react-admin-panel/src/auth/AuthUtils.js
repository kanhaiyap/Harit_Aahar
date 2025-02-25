import axios from "axios";

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
