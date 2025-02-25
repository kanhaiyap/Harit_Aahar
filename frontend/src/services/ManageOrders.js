import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);

  // Fetch orders from API when the component mounts
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders/');  // Adjust this URL based on your backend API
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleDelete = async (orderId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this order?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`/api/orders/${orderId}/`);  // Adjust this URL based on your backend API
      setOrders(orders.filter(order => order.id !== orderId));  // Remove the deleted order from the state
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  return (
    <div>
      <h1>Manage Orders</h1>
      <table border="1" cellPadding="10" cellSpacing="0">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>User</th>
            <th>Total Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.user.username}</td>
                <td>₹{order.total_amount}</td>
                <td>{order.status}</td>
                <td>
                  <Link to={`/orders/${order.id}`} className="btn btn-primary" style={{ marginRight: '10px' }}>
                    View
                  </Link>
                  <button 
                    className="btn btn-danger" 
                    onClick={() => handleDelete(order.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No orders found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ManageOrders;
