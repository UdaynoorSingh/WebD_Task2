import React from 'react';
import { Link } from 'react-router-dom';
import './CartIcon.css';

const CartIcon = ({ count }) => {
  return (
    <Link to="/cart" className="cart-icon">
      <span role="img" aria-label="Shopping Cart">🛒</span>
      {count > 0 && (
        <span className="cart-count">{count}</span>
      )}
    </Link>
  );
};

export default CartIcon;