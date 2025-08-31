import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../../services/productService';
import ProductCard from '../../components/marketplace/ProductCard/ProductCard';
import SearchFilters from '../../components/marketplace/SearchFilters/SearchFilters';
import Pagination from '../../components/marketplace/Pagination/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import './Marketplace.css';

const Marketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    hasNext: false,
    hasPrev: false
  });

  const getFiltersFromParams = () => {
    return {
      page: searchParams.get('page') || 1,
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      condition: searchParams.get('condition') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      location: searchParams.get('location') || '',
      sort: searchParams.get('sort') || 'newest'
    };
  };

  const [filters, setFilters] = useState(getFiltersFromParams());

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getProducts(filters);
        
        setProducts(data.products);
        setPagination({
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          totalProducts: data.totalProducts,
          hasNext: data.hasNext,
          hasPrev: data.hasPrev
        });
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters, searchParams]);

  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    
    const params = new URLSearchParams();
    Object.keys(updatedFilters).forEach(key => {
      if (updatedFilters[key]) {
        params.set(key, updatedFilters[key]);
      }
    });
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    
    const params = new URLSearchParams();
    Object.keys(updatedFilters).forEach(key => {
      if (updatedFilters[key]) {
        params.set(key, updatedFilters[key]);
      }
    });
    setSearchParams(params);
    
    window.scrollTo(0, 0);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="marketplace">
      <div className="container">
        <div className="marketplace-header">
          <h1>Marketplace</h1>
          <p>Browse {pagination.totalProducts} products available for sale</p>
        </div>

        <div className="marketplace-content">
          <aside className="filters-sidebar">
            <SearchFilters 
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </aside>

          <main className="products-main">
            {error && <div className="error-message">{error}</div>}
            
            {products.length > 0 ? (
              <>
                <div className="products-grid">
                  {products.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
                
                <Pagination 
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            ) : (
              <div className="no-products">
                <h3>No products found</h3>
                <p>Try adjusting your search filters or browse all categories.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;