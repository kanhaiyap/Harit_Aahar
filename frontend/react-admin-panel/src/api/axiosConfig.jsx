import axios from "axios";

// ✅ Export the function so it can be used elsewhere
export function getCsrfFromCookies() {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    if (cookie.startsWith("csrftoken=")) {
      return cookie.split("=")[1];
    }
  }
  return "";
}

// ✅ Create Axios instance with proper settings
const axiosInstance = axios.create({
  baseURL: "http://localhost:8000",  // ✅ Ensure it's using `localhost`
  withCredentials: true,  // ✅ Ensures cookies are included
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Dynamically set CSRF token before each request
axiosInstance.interceptors.request.use(
  (config) => {
    const csrfToken = getCsrfFromCookies();
    if (csrfToken) {
      config.headers["X-CSRFToken"] = csrfToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
