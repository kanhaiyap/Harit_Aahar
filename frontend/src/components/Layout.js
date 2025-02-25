import React, {useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import '../assets/styles/style.css';
import logo from '../assets/images/LOGO.png';

const Layout = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user')); 
    setUser(storedUser);
  }, []);

  const handleProfileClick = () => {
    if (user) {
      navigate('/profile'); // Redirect to profile if logged in
    } else {
      navigate('/login'); // Redirect to login if not logged in
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();  // Prevent traditional form submission
    if (searchQuery.trim() !== '') {
      navigate(`/products?search=${searchQuery}`);  // Redirect to Products page with the search query
    }
  };

  return (
    <>
      {/* Header */}
      <header>
        <div className="header-container">
        <Link to="/">
            <img className="logo" src={logo} alt="Logo" />
          </Link>

          <nav>
            <ul className="nav-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>

            <div className="search-form-container">
              <form onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  name="query"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit">Search</button>
              </form>
            </div>
          </nav>

          <div className="header-right">
          <Link to={user ? "/profile" : "/login"} className="profile-icon">
  <i className="fa fa-user" aria-hidden="true" style={{ fontSize: '30px' }}></i>
</Link>

            <Link to="/cart" className="cart-btn" onClick={handleProfileClick}>
              <span className="cart-icon">
                <i className="fa fa-shopping-cart" style={{ fontSize: '24px' }}></i>
                <span id="cart-count">0</span>
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
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
