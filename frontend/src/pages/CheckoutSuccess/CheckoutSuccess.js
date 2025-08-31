import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './CheckoutSuccess.css';

const CheckoutSuccess = () => {
  const location = useLocation();
  const { order } = location.state || {};

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (!order) {
    return (
      <div className="checkout-success">
        <div className="container">
          <div className="success-container">
            <h2>Order Not Found</h2>
            <p>We couldn't find your order details.</p>
            <Link to="/" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-success">
      <div className="container">
        <div className="success-container">
          <div className="success-icon">🎉</div>
          <h1>Order Confirmed!</h1>
          <p className="success-message">
            Thank you for your purchase. Your order has been confirmed and is being processed.
          </p>

          <div className="order-details">
            <h3>Order Details</h3>
            <div className="detail-row">
              <span>Order ID:</span>
              <span>{order.id}</span>
            </div>
            <div className="detail-row">
              <span>Total Amount:</span>
              <span>{formatPrice(order.total)}</span>
            </div>
            <div className="detail-row">
              <span>Platform Fee:</span>
              <span>{formatPrice(order.platformFee)}</span>
            </div>
            <div className="detail-row">
              <span>Order Status:</span>
              <span className="status-badge">{order.status}</span>
            </div>
            <div className="detail-row">
              <span>Order Date:</span>
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="success-actions">
            <Link to="/transactions" className="btn btn-primary">
              View Order History
            </Link>
            <Link to="/marketplace" className="btn btn-secondary">
              Continue Shopping
            </Link>
          </div>

          <div className="support-info">
            <h4>Need Help?</h4>
            <p>
              If you have any questions about your order, please contact our support team at 
              <a href="mailto:support@resellhub.com"> support@resellhub.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;