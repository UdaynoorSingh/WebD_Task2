import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import ProductCard from '../../components/marketplace/ProductCard/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import './Home.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const [featuredData, recentData] = await Promise.all([
          productService.getFeaturedProducts(),
          productService.getProducts({ limit: 8, sort: 'newest' })
        ]);
        
        setFeaturedProducts(featuredData);
        setRecentProducts(recentData.products);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Welcome to ResellHub</h1>
            <p>Buy and sell pre-loved items with ease. Find great deals or make money from your unused items.</p>
            <div className="hero-buttons">
              <Link to="/marketplace" className="btn btn-primary">Browse Marketplace</Link>
              <Link to="/create-listing" className="btn btn-secondary">Sell an Item</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="featured-section">
        <div className="container">
          <h2>Featured Products</h2>
          {error && <div className="error-message">{error}</div>}
          
          {featuredProducts.length > 0 ? (
            <div className="products-grid">
              {featuredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <p className="no-products">No featured products available at the moment.</p>
          )}
        </div>
      </section>

      <section className="recent-section">
        <div className="container">
          <div className="section-header">
            <h2>Recently Added</h2>
            <Link to="/marketplace" className="view-all">View All</Link>
          </div>
          
          {recentProducts.length > 0 ? (
            <div className="products-grid">
              {recentProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <p className="no-products">No products available yet.</p>
          )}
        </div>
      </section>

      <section className="categories-section">
        <div className="container">
          <h2>Browse by Category</h2>
          <div className="categories-grid">
            <Link to="/marketplace?category=Electronics" className="category-card">
              <div className="category-icon">📱</div>
              <h3>Electronics</h3>
            </Link>
            <Link to="/marketplace?category=Clothing" className="category-card">
              <div className="category-icon">👕</div>
              <h3>Clothing</h3>
            </Link>
            <Link to="/marketplace?category=Furniture" className="category-card">
              <div className="category-icon">🛋️</div>
              <h3>Furniture</h3>
            </Link>
            <Link to="/marketplace?category=Books" className="category-card">
              <div className="category-icon">📚</div>
              <h3>Books</h3>
            </Link>
            <Link to="/marketplace?category=Sports" className="category-card">
              <div className="category-icon">⚽</div>
              <h3>Sports</h3>
            </Link>
            <Link to="/marketplace?category=Other" className="category-card">
              <div className="category-icon">📦</div>
              <h3>Other</h3>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;