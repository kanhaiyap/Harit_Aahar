import React from 'react';
import './assets/scripts/script.js'
import './assets/styles/style.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import Login from './auth/Login';
import Checkout from './pages/Checkout.js';

import ManageOrders from './services/ManageOrders.js';
import ManageProducts from './services/ManageProducts.js';
import ManageAddresses from './services/ManageAddresses';
import ManageInventoryLogs from './services/ManageInventoryLogs';
import ManagePayments from './services/ManagePayments';
import ManageUsers from './services/ManageUsers';



import Signup from './auth/Signup';  // Adjust the path based on your folder structure
import ForgotPassword from './auth/ForgotPassword.js';







function App() {
  const user = true;  // Replace with your user authentication logic

  return (
    <Router>
      <Routes>
        {/* The Layout component wraps all routes */}
        <Route path="/" element={<Layout user={user} />}>
          <Route index element={<Home />} />  {/* Home Page */}
          <Route path="/products" element={<Products />} />
         
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/manageorders" element={<ManageOrders />} />
          <Route path="/manageproducts" element={<ManageProducts />} />
          <Route path='/Checkout' element={<Checkout />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />

          <Route path="/manage-addresses" element={<ManageAddresses />} />
    <Route path="/manage-inventory" element={<ManageInventoryLogs />} />
    <Route path="/manage-payments" element={<ManagePayments />} />
    <Route path="/manage-users" element={<ManageUsers />} />
    <Route path="/signup" element={<Signup />} />  {/* Add Signup Route */}
  

      
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
