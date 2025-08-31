import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useCart } from "../../../context/CartContext";
import { productService } from "../../../services/productService";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [isLiking, setIsLiking] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [likes, setLikes] = useState(product.likes.length);
  const [isLiked, setIsLiked] = useState(
    user ? product.likes.includes(user.id) : false
  );
  const [imageError, setImageError] = useState(false);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    setIsLiking(true);
    try {
      const response = await productService.toggleLike(product._id);
      setIsLiked(response.liked);
      setLikes(response.likesCount);
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart(product._id, 1);
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/images/placeholder.png";
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/uploads/")) {
      return `http://localhost:5000${imagePath}`;
    }
    return "/images/placeholder.png";
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product._id}`} className="product-link">
        <div className="product-image">
          <img
            src={getImageUrl(product.images[0])}
            alt={product.name}
            onError={(e) => {
              setImageError(true);
              e.target.src = "/images/placeholder.png";
            }}
          />
          {product.featured && <span className="featured-badge">Featured</span>}
          <button
            className={`like-btn ${isLiked ? "liked" : ""}`}
            onClick={handleLike}
            disabled={isLiking}
            aria-label={isLiked ? "Unlike product" : "Like product"}
          >
            ♥
          </button>
        </div>

        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-description">
            {product.description.substring(0, 60)}...
          </p>

          <div className="product-meta">
            <span className="product-condition">{product.condition}</span>
            <span className="product-category">{product.category}</span>
          </div>

          <div className="product-price">{formatPrice(product.price)}</div>

          {product.originalPrice && product.originalPrice > product.price && (
            <div className="original-price">
              {formatPrice(product.originalPrice)}
            </div>
          )}

          <div className="product-footer">
            <div className="seller-info">
              <img
                src={
                  product.seller.avatar
                    ? product.seller.avatar.startsWith("http")
                      ? product.seller.avatar
                      : product.seller.avatar.startsWith("/uploads/")
                      ? `http://localhost:5000${product.seller.avatar}`
                      : "/images/user-avatar.png"
                    : "/images/user-avatar.png"
                }
                alt={product.seller.name}
                className="seller-avatar"
                onError={(e) => {
                  e.target.src = "/images/user-avatar.png";
                }}
              />
              <span className="seller-name">{product.seller.name}</span>
            </div>

            <div className="product-stats">
              <span className="likes-count">{likes} likes</span>
              <span className="views-count">{product.viewCount} views</span>
            </div>
          </div>
        </div>
      </Link>

      <div className="product-actions">
        <button
          className="btn btn-primary add-to-cart-btn"
          onClick={handleAddToCart}
          disabled={isAddingToCart || product.status !== "Available"}
        >
          {isAddingToCart ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
