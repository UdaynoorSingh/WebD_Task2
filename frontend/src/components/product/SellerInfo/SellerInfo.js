import React from "react";
import { Link } from "react-router-dom";
import "./SellerInfo.css";

const SellerInfo = ({ seller }) => {
  const formatRating = (rating) => {
    return rating ? rating.toFixed(1) : "No ratings yet";
  };

  return (
    <div className="seller-info-card">
      <h3>Seller Information</h3>

      <div className="seller-details">
        <div className="seller-header">
          <img
            src={
              seller.avatar
                ? seller.avatar.startsWith("http")
                  ? seller.avatar
                  : seller.avatar.startsWith("/uploads/")
                  ? `http://localhost:5000${seller.avatar}`
                  : "/images/user-avatar.png"
                : "/images/user-avatar.png"
            }
            alt={seller.name}
            className="seller-avatar-large"
            crossOrigin="anonymous"
            onError={(e) => {
              e.target.src = "/images/user-avatar.png";
            }}
          />
          <div className="seller-name-rating">
            <h4>{seller.name}</h4>
            <div className="seller-rating">
              <span className="rating-stars">★★★★★</span>
              <span className="rating-value">
                {formatRating(seller.rating)}
              </span>
              {seller.totalReviews > 0 && (
                <span className="reviews-count">
                  ({seller.totalReviews} reviews)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="seller-stats">
          <div className="stat-item">
            <span className="stat-label">Member since</span>
            <span className="stat-value">
              {new Date(seller.createdAt).toLocaleDateString()}
            </span>
          </div>

          {seller.location && (
            <div className="stat-item">
              <span className="stat-label">Location</span>
              <span className="stat-value">
                {seller.location.city && `${seller.location.city}, `}
                {seller.location.state && `${seller.location.state}, `}
                {seller.location.country}
              </span>
            </div>
          )}
        </div>

        <div className="seller-actions">
          <Link to={`/seller/${seller._id}`} className="btn btn-primary">
            View Profile
          </Link>
          <button className="btn btn-secondary">Contact Seller</button>
        </div>
      </div>
    </div>
  );
};

export default SellerInfo;
