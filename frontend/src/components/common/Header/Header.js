import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useCart } from "../../../context/CartContext";
import SearchBar from "../SearchBar/SearchBar";
import CartIcon from "../../cart/CartIcon/CartIcon";
import "./Header.css";

const Header = () => {
  const { user, logout } = useAuth();
  const { getCartItemsCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h2>ResellHub</h2>
          </Link>

          <SearchBar />

          <nav className={`nav ${isMenuOpen ? "nav-open" : ""}`}>
            <Link
              to="/marketplace"
              className="nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Marketplace
            </Link>

            {user ? (
              <>
                <CartIcon count={getCartItemsCount()} />
                <div className="user-menu">
                  <span className="user-greeting">Hello, {user.name}</span>
                  <div className="dropdown">
                    <button className="dropdown-toggle">
                      <img 
                        src={user.avatar ? `http://localhost:5000${user.avatar}` : '/images/user-avatar.png'} 
                        alt={user.name}
                        className="user-avatar"
                        onError={(e) => {
                             e.target.src = '/images/user-avatar.png';
                           }}
                      />
                    </button>
                    <div className="dropdown-menu">
                      <Link
                        to="/dashboard"
                        className="dropdown-item"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>

                      {user.role === 'seller' && (
                        <Link to="/seller-dashboard" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                          Seller Dashboard
                        </Link>
                      )}

                      <Link to="/profile" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                         Profile Settings
                       </Link>
                       
                      <Link
                        to="/favorites"
                        className="dropdown-item"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Favorites
                      </Link>
                      <Link
                        to="/transactions"
                        className="dropdown-item"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Transactions
                      </Link>
                      {user.role === "seller" && (
                        <Link
                          to="/create-listing"
                          className="dropdown-item"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Sell Item
                        </Link>
                      )}
                      <button onClick={handleLogout} className="dropdown-item">
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="auth-links">
                <Link
                  to="/login"
                  className="nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>

          <button className="menu-toggle" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
