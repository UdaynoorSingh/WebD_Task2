import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import CartItem from '../../components/cart/CartItem/CartItem';
import CartSummary from '../../components/cart/CartSummary/CartSummary';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import './Cart.css';

const Cart = () => {
  const { user } = useAuth();
  const { items, loading, removeFromCart, updateQuantity, getCartTotal } = useCart();

  if (!user) {
    return (
      <div className="container">
        <div className="auth-required">
          <h2>Please log in to view your cart</h2>
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (items.length === 0) {
    return (
      <div className="container">
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Add some items to your cart to get started.</p>
          <Link to="/marketplace" className="btn btn-primary">
            Browse Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  return (
    <div className="cart">
      <div className="container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <span className="items-count">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {items.map(item => (
              <CartItem
                key={item._id}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>

          <div className="cart-sidebar">
            <CartSummary 
              items={items}
              total={getCartTotal()}
            />
            
            <Link to="/checkout" className="btn btn-primary checkout-btn">
              Proceed to Checkout
            </Link>
            
            <Link to="/marketplace" className="continue-shopping">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;