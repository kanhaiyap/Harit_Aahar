import { useEffect, useState } from "react";
import axios from "axios";

const Shipping = () => {
  const [shippingDetails, setShippingDetails] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/admin/shipping/", {
      headers: { Authorization: `Token ${localStorage.getItem("authToken")}` },
    })
    .then(response => setShippingDetails(response.data))
    .catch(error => console.error("Error fetching shipping details", error));
  }, []);

  return (
    <div>
      <h2>Manage Shipping</h2>
      <ul>
        {shippingDetails.map(detail => (
          <li key={detail.id}>
            Order #{detail.order_id} - {detail.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Shipping;
