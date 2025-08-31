import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { productService } from "../../services/productService";
import ProductGallery from "../../components/product/ProductGallery/ProductGallery";
import SellerInfo from "../../components/product/SellerInfo/SellerInfo";
import PriceHistory from "../../components/product/PriceHistory/PriceHistory";
import LoadingSpinner from "../../components/common/LoadingSpinner/LoadingSpinner";
import "./ProductDetail.css";

const getImageUrl = (imagePath) => {
  if (!imagePath) return "/images/placeholder-product.jpg";
  if (imagePath.startsWith("http")) return imagePath;
  if (imagePath.startsWith("/uploads/")) {
    return `http://localhost:5000${imagePath}`;
  }
  return "/images/placeholder-product.jpg";
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productData = await productService.getProduct(id);
        setProduct(productData);
      } catch (err) {
        setError("Product not found or failed to load.");
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleLike = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setIsLiking(true);
    try {
      const response = await productService.toggleLike(product._id);
      setProduct((prev) => ({
        ...prev,
        likes: response.liked
          ? [...prev.likes, user.id]
          : prev.likes.filter((id) => id !== user.id),
      }));
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart(product._id, quantity);
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleContactSeller = () => {
    if (!user) {
      navigate("/login");
      return;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !product) {
    return (
      <div className="container">
        <div className="error-container">
          <h2>{error || "Product not found"}</h2>
          <button
            onClick={() => navigate("/marketplace")}
            className="btn btn-primary"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const isLiked = user && product.likes.includes(user.id);
  const isOwner = user && product.seller._id === user.id;

  return (
    <div className="product-detail">
      <div className="container">
        <div className="product-detail-content">
          <div className="product-gallery-section">
            <ProductGallery
              images={product.images.map((img) => getImageUrl(img))}
            />
          </div>

          <div className="product-info-section">
            <div className="product-header">
              <h1>{product.name}</h1>
              <button
                className={`like-btn ${isLiked ? "liked" : ""}`}
                onClick={handleLike}
                disabled={isLiking || isOwner}
                aria-label={isLiked ? "Unlike product" : "Like product"}
              >
                ♥ {product.likes.length}
              </button>
            </div>

            <div className="product-price">
              <span className="current-price">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <span className="original-price">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
            </div>

            <div className="product-meta">
              <span
                className={`status-badge status-${product.status.toLowerCase()}`}
              >
                {product.status}
              </span>
              <span className="condition">Condition: {product.condition}</span>
              <span className="category">Category: {product.category}</span>
            </div>

            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            {product.tags && product.tags.length > 0 && (
              <div className="product-tags">
                <h3>Tags</h3>
                <div className="tags-list">
                  {product.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {!isOwner && product.status === "Available" && (
              <div className="purchase-section">
                <div className="quantity-selector">
                  <label htmlFor="quantity">Quantity:</label>
                  <select
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="action-buttons">
                  <button
                    className="btn btn-primary add-to-cart-btn"
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                  >
                    {isAddingToCart ? "Adding..." : "Add to Cart"}
                  </button>

                  <button
                    className="btn btn-secondary contact-seller-btn"
                    onClick={handleContactSeller}
                  >
                    Contact Seller
                  </button>
                </div>
              </div>
            )}

            {isOwner && (
              <div className="owner-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate(`/edit-product/${product._id}`)}
                >
                  Edit Product
                </button>
              </div>
            )}
          </div>

          <div className="seller-section">
            <SellerInfo seller={product.seller} />
          </div>
        </div>

        <div className="product-additional-sections">
          <PriceHistory productId={product._id} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
