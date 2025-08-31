import React, { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useFavorites } from "../../context/FavoritesContext";
import ProductCard from "../../components/marketplace/ProductCard/ProductCard";
import LoadingSpinner from "../../components/common/LoadingSpinner/LoadingSpinner";
import "./Favorites.css";

const Favorites = () => {
  const { user } = useAuth();
  const { items, loading, error, loadFavorites } = useFavorites();

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user, loadFavorites]);

  if (!user) {
    return (
      <div className="container">
        <div className="auth-required">
          <h2>Please log in to view your favorites</h2>
          <p>Sign in to see your saved items</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="favorites-page">
      <div className="container">
        <div className="favorites-header">
          <h1>Your Favorites</h1>
          <p>
            {items.length} {items.length === 1 ? "item" : "items"} saved
          </p>
        </div>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
            <button 
              onClick={loadFavorites} 
              className="retry-btn"
              style={{ marginLeft: '10px', padding: '5px 10px' }}
            >
              Retry
            </button>
          </div>
        )}

        {items.length > 0 ? (
          <div className="favorites-grid">
            {items.map((product) => (
              <ProductCard 
                key={product._id} 
                product={product} 
                showFavoriteButton={true}
              />
            ))}
          </div>
        ) : (
          <div className="empty-favorites">
            <div className="empty-icon">❤️</div>
            <h2>No favorites yet</h2>
            <p>Start saving items you love by clicking the heart icon</p>
            <a href="/marketplace" className="btn btn-primary">
              Browse Marketplace
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;