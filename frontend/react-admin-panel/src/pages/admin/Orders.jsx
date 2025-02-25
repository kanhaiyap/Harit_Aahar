import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../../components/Header";  // adjust the path as needed

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    axios
      .get("http://127.0.0.1:8000/api/admin/orders/", {
        headers: { Authorization: `Token ${token}` },
      })
      .then((response) => {
        console.log("Fetched orders:", response.data);
        let data = response.data;
        // If your API returns an object (e.g., { orders: [...] }), adjust accordingly:
        if (!Array.isArray(data) && data.orders) {
          data = data.orders;
        }
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching orders:", err.response || err);
        setError("Error fetching orders. Please check your admin access.");
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <Header />
      <div className="p-5">
        <h2 className="text-2xl font-bold mb-4">Manage Orders</h2>
        {loading ? (
          <div>Loading orders...</div>
        ) : error ? (
          <div style={{ color: "red" }}>{error}</div>
        ) : orders.length === 0 ? (
          <div>No orders found.</div>
        ) : (
          <ul>
            {orders.map((order) => (
              <li key={order.id}>
                Order #{order.id} - ₹{order.total_amount} - {order.status}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Orders;
