import React from 'react';

const CartSummary = ({ items, total }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemsCount = items.reduce((count, item) => count + item.quantity, 0);

  const calculatePlatformFee = (subtotal) => {
    const seed = process.env.REACT_APP_ASSIGNMENT_SEED ;
    const seedNumber = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const n = seedNumber % 10;
    
    const percentageFee = subtotal * 0.017;
    const totalFee = Math.floor(percentageFee + n);
    
    return Math.max(totalFee, 1);
  };

  const platformFee = calculatePlatformFee(subtotal);

  return (
    <div className="cart-summary">
      <h3>Order Summary</h3>
      
      <div className="summary-item">
        <span>Items ({itemsCount})</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      
      <div className="summary-item">
        <span>Platform Fee</span>
        <span>{formatPrice(platformFee)}</span>
      </div>
      
      <div className="summary-divider"></div>
      
      <div className="summary-total">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
      
      <div className="fee-explanation">
        <small>Platform fee: 1.7% + n from seed = {formatPrice(platformFee)}</small>
      </div>
    </div>
  );
};

export default CartSummary;