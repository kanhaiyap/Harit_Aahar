import { useState, useEffect } from "react";
import axios, { getCsrfFromCookies } from "../../api/axiosConfig";  // ✅ Import function
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/get-csrf-token/")
      .then(() => {
        setTimeout(() => {  
          const token = getCsrfFromCookies();
          console.log("✅ CSRF Token Retrieved from Cookies:", token);
        }, 500);
      })
      .catch((error) => console.error("❌ CSRF Token Fetch Error:", error));
  }, []);

  // ✅ This function updates the state when the user types
  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const csrfToken = getCsrfFromCookies();
    console.log("📌 CSRF Token Retrieved:", csrfToken);

    if (!csrfToken) {
        console.error("❌ CSRF Token is missing. Cannot proceed with login.");
        setError("Security error: CSRF token missing. Please refresh and try again.");
        return;
    }

    console.log("📌 Sending Login Request:");
    console.log("Username:", credentials.username);
    console.log("Password:", credentials.password);

    try {
        const response = await axios.post(
            "/api/admin/login/",
            { username: credentials.username, password: credentials.password },
            {
                headers: { 
                    "X-CSRFToken": csrfToken, 
                    "Content-Type": "application/json"  // ✅ Ensure correct header
                },
                withCredentials: true,  // ✅ Ensure cookies are included
            }
        );

        console.log("✅ Login Response:", response.data);

        if (response.data.success) {
            localStorage.setItem("authToken", response.data.token);
            alert("Login Successful");
            navigate("/dashboard");
        }
    } catch (error) {
        console.error("❌ Login failed:", error.response?.data);
        setError("Invalid credentials. Please try again.");
    }
};

  return (
    <div>
      <h2>🔐 Admin Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input 
          type="text" 
          name="username" 
          placeholder="Username or Email" 
          value={credentials.username}  // ✅ Ensure input reflects state
          onChange={handleChange}  // ✅ Update state on change
          required 
        />
        <input 
          type="password" 
          name="password" 
          placeholder="Password" 
          value={credentials.password}  // ✅ Ensure input reflects state
          onChange={handleChange}  // ✅ Update state on change
          required 
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default AdminLogin;
