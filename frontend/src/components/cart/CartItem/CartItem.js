import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./CartItem.css";

const CartItem = ({ item, onQuantityChange, onRemove }) => {
  const [quantity, setQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;

    setIsUpdating(true);
    setQuantity(newQuantity);

    try {
      await onQuantityChange(item._id, newQuantity);
    } catch (error) {
      setQuantity(item.quantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = () => {
    onRemove(item._id);
  };

  const totalPrice = item.price * item.quantity;

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        <Link to={`/product/${item.product._id}`}>
          <img
            src={
              item.product.images && item.product.images[0]
                ? item.product.images[0].startsWith("http")
                  ? item.product.images[0]
                  : `http://localhost:5000${item.product.images[0]}`
                : "/images/placeholder.png"
            }
            alt={item.product.name}
            crossOrigin="anonymous"
            onError={(e) => {
              e.target.src = "/images/placeholder.png";
            }}
          />
        </Link>
      </div>

      <div className="cart-item-details">
        <Link to={`/product/${item.product._id}`} className="cart-item-name">
          {item.product.name}
        </Link>
        <p className="cart-item-category">{item.product.category}</p>
        <p className="cart-item-condition">
          Condition: {item.product.condition}
        </p>

        {item.product.status !== "Available" && (
          <p className="cart-item-unavailable">
            This item is no longer available
          </p>
        )}
      </div>

      <div className="cart-item-price">
        <div className="price">{formatPrice(item.price)}</div>
        <div className="total">Total: {formatPrice(totalPrice)}</div>
      </div>

      <div className="cart-item-quantity">
        <label htmlFor={`quantity-${item._id}`}>Qty:</label>
        <select
          id={`quantity-${item._id}`}
          value={quantity}
          onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
          disabled={isUpdating || item.product.status !== "Available"}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      <div className="cart-item-actions">
        <button
          className="remove-btn"
          onClick={handleRemove}
          disabled={isUpdating}
          aria-label="Remove item"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default CartItem;
