import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { checkoutService } from "../../services/checkoutService";
import LoadingSpinner from "../../components/common/LoadingSpinner/LoadingSpinner";
import "./Checkout.css";

const Checkout = () => {
  const { user } = useAuth();
  const { items, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    paymentMethod: "credit_card",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const shippingAddress = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        zipCode: formData.zipCode,
      };

      const response = await checkoutService.processCheckout({
        shippingAddress,
        paymentMethod: formData.paymentMethod,
      });

      await clearCart();
      navigate("/checkout/success", {
        state: { order: response.order },
      });
    } catch (err) {
      setError(
        err.response?.data?.error || "Checkout failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  if (!user) {
    navigate("/login", { state: { from: "/checkout" } });
    return null;
  }

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const subtotal = getCartTotal();
  const platformFee = Math.floor(subtotal * 0.017 + 5); 
  const total = subtotal + platformFee;

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <p>Complete your purchase</p>
        </div>

        <div className="checkout-content">
          <div className="checkout-form-section">
            <form onSubmit={handleSubmit} className="checkout-form">
              {error && <div className="error-message">{error}</div>}

              <div className="form-section">
                <h3>Shipping Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName" className="form-label">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName" className="form-label">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="address" className="form-label">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city" className="form-label">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="state" className="form-label">
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="country" className="form-label">
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="zipCode" className="form-label">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Payment Method</h3>
                <div className="payment-methods">
                  <label className="payment-method">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit_card"
                      checked={formData.paymentMethod === "credit_card"}
                      onChange={handleChange}
                    />
                    <span>Credit Card</span>
                  </label>
                  <label className="payment-method">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={formData.paymentMethod === "paypal"}
                      onChange={handleChange}
                    />
                    <span>PayPal</span>
                  </label>
                  <label className="payment-method">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={formData.paymentMethod === "bank_transfer"}
                      onChange={handleChange}
                    />
                    <span>Bank Transfer</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary checkout-btn"
                disabled={loading}
              >
                {loading ? (
                  <LoadingSpinner size="small" message="" />
                ) : (
                  "Complete Purchase"
                )}
              </button>
            </form>
          </div>

          <div className="checkout-summary">
            <div className="order-summary">
              <h3>Order Summary</h3>

              <div className="order-items">
                {items.map((item) => (
                  <div key={item._id} className="order-item">
                    <div className="item-info">
                      <span className="item-name">{item.product.name}</span>
                      <span className="item-quantity">
                        Qty: {item.quantity}
                      </span>
                    </div>
                    <div className="item-price">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="total-row">
                  <span>Platform Fee</span>
                  <span>{formatPrice(platformFee)}</span>
                </div>
                <div className="total-row final-total">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
