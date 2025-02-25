import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import '../assets/styles/style.css';
import logo from '../assets/images/LOGO.png';  // Import the image

const Layout = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove authentication token and user info from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    // Dispatch a storage event to notify other parts of the app
    window.dispatchEvent(new Event("storage"));
    // Redirect to the login page
    navigate('/login');
  };
  return (
    <>
      {/* Header */}
      <header>
        <div className="header-container">
          <Link to="/">
            <img className="logo" src={logo} alt="Logo" />  {/* Use the imported image */}
          </Link>

          <nav>
            <ul className="nav-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>

            <div className="search-form-container">
              <form action="/product_search" method="get">
                <input type="text" name="query" placeholder="Search for products..." />
                <button type="submit">Search</button>
              </form>
            </div>
          </nav>

          <div className="header-right">
          {user ? (
              <>
                <Link to="/profile" className="profile-icon">
                  <i className="fa fa-user" aria-hidden="true" style={{ fontSize: '30px' }}></i>
                </Link>
                {/* Logout button */}
                <button onClick={handleLogout}>Logout</button>
              </>
              
            ) : (
              <Link to="/login" className="login-btn">Login</Link>
            )}
            <Link to="/cart" className="cart-btn">
              <span className="cart-icon">
                <i className="fa fa-shopping-cart" style={{ fontSize: '24px' }}></i>
                <span id="cart-count">0</span>
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />  {/* This will render the page-specific content */}
      </main>

      {/* Footer */}
      <footer>
        <p>&copy; 2025 Harit Aahar. All Rights Reserved.</p>
        <p>Designed to promote eco-friendly, sustainable food practices.</p>
      </footer>
    </>
  );
};

export default Layout;
