// src/components/AdminLayout.jsx
import React from "react";
import { Outlet, Link } from "react-router-dom";
import Header from "./Header"; // Your Header component

const AdminLayout = () => {
  return (
    <div>
      <Header />
      <nav className="bg-gray-200 p-4">
        <ul className="flex space-x-4">
          <li>
            <Link to="/admin/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/admin/categories">Categories</Link>
          </li>
          <li>
            <Link to="/admin/orders">Orders</Link>
          </li>
          <li>
            <Link to="/admin/shipping">Shipping</Link>
          </li>
          <li>
            <Link to="/admin/inventory">Inventory</Link>
          </li>
          <li>
            <Link to="/admin/upload-csv">Upload CSV</Link>
          </li>
          <li>
            <Link to="/admin/product_upload">Product Upload</Link>
          </li>
        </ul>
      </nav>
      {/* Outlet renders the child route component */}
      <div className="p-5">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
