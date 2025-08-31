import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { checkoutService } from '../../services/checkoutService';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import './Transactions.css';

const Transactions = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const ordersPerPage = 10;

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await checkoutService.getOrderHistory({
          page: currentPage,
          limit: ordersPerPage
        });
        
        setOrders(response.orders);
        setTotalPages(response.totalPages);
      } catch (err) {
        setError('Failed to load orders. Please try again.');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, currentPage]);

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: 'var(--warning-color)',
      processing: 'var(--primary-color)',
      shipped: 'var(--info-color)',
      delivered: 'var(--success-color)',
      cancelled: 'var(--danger-color)'
    };
    return statusColors[status] || 'var(--gray-color)';
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  if (!user) {
    return (
      <div className="container">
        <div className="auth-required">
          <h2>Please log in to view your transactions</h2>
          <p>Sign in to see your order history</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="transactions-page">
      <div className="container">
        <div className="transactions-header">
          <h1>Order History</h1>
          <p>View your past purchases and orders</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="transactions-controls">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Orders
            </button>
            <button
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button
              className={`filter-btn ${filter === 'processing' ? 'active' : ''}`}
              onClick={() => setFilter('processing')}
            >
              Processing
            </button>
            <button
              className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`}
              onClick={() => setFilter('delivered')}
            >
              Delivered
            </button>
            <button
              className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
              onClick={() => setFilter('cancelled')}
            >
              Cancelled
            </button>
          </div>
        </div>

        {filteredOrders.length > 0 ? (
          <>
            <div className="orders-table">
              <div className="table-header">
                <span>Order ID</span>
                <span>Date</span>
                <span>Items</span>
                <span>Total</span>
                <span>Status</span>
                <span>Actions</span>
              </div>

              {filteredOrders.map(order => (
                <div key={order._id} className="table-row">
                  <span className="order-id">#{order._id.slice(-8)}</span>
                  <span className="order-date">{formatDate(order.createdAt)}</span>
                  <span className="order-items">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </span>
                  <span className="order-total">{formatPrice(order.total)}</span>
                  <span 
                    className="order-status"
                    style={{ color: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </span>
                  <div className="order-actions">
                    <button
                      className="view-order-btn"
                      onClick={() => {}}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  className="pagination-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-orders">
            <div className="empty-icon">📦</div>
            <h2>No orders found</h2>
            <p>
              {filter === 'all' 
                ? "You haven't placed any orders yet."
                : `No ${filter} orders found.`
              }
            </p>
            <a href="/marketplace" className="btn btn-primary">
              Start Shopping
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;