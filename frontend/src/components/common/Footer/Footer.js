import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>ResellHub</h3>
            <p>Buy and sell pre-loved items with confidence. Join our community of savvy shoppers and sellers.</p>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/marketplace">Marketplace</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/help">Help Center</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Categories</h4>
            <ul>
              <li><Link to="/marketplace?category=Electronics">Electronics</Link></li>
              <li><Link to="/marketplace?category=Clothing">Clothing</Link></li>
              <li><Link to="/marketplace?category=Furniture">Furniture</Link></li>
              <li><Link to="/marketplace?category=Books">Books</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Connect</h4>
            <div className="social-links">
              <a href="#" aria-label="Facebook">Facebook</a>
              <a href="#" aria-label="Twitter">Twitter</a>
              <a href="#" aria-label="Instagram">Instagram</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 ResellHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;