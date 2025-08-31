import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { sellerService } from "../../services/sellerService";
import LoadingSpinner from "../../components/common/LoadingSpinner/LoadingSpinner";
import "./SellerDashboard.css";

const SellerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("all");
  const [reviews, setReviews] = useState([]);
  const [reviewsStats, setReviewsStats] = useState({});

  useEffect(() => {
    if (user && user.role === "seller") {
      loadSellerData();
    }
  }, [user, currentPage, filter]);

  const loadSellerData = async () => {
    try {
      setLoading(true);

      if (activeTab === "overview") {
        const [ordersData, statsData, reviewsData] = await Promise.all([
          sellerService.getSellerOrders({
            page: currentPage,
            limit: 5,
            status: filter,
          }),
          sellerService.getSellerStats(),
          sellerService.getSellerReviews({ limit: 5 })
        ]);

        setOrders(ordersData.orders);
        setTotalPages(ordersData.totalPages);
        setStats(statsData);
        setReviews(reviewsData.reviews);
        setReviewsStats({
          averageRating: reviewsData.averageRating,
          totalReviews: reviewsData.totalReviews
        });

      } else if (activeTab === "orders") {
        const ordersData = await sellerService.getSellerOrders({
          page: currentPage,
          limit: 10,
          status: filter,
        });

        setOrders(ordersData.orders);
        setTotalPages(ordersData.totalPages);
      }
      else if (activeTab === 'reviews') {
        const reviewsData = await sellerService.getSellerReviews({ 
          page: currentPage, 
          limit: 10 
        });

        setReviews(reviewsData.reviews);
        setTotalPages(reviewsData.totalPages);
        setReviewsStats({
          averageRating: reviewsData.averageRating,
          totalReviews: reviewsData.totalReviews
        });
      }
    } catch (err) {
      setError("Failed to load seller data");
      console.error("Error loading seller data:", err);
    } finally {
      setLoading(false);
    }
  };

    const handleCompleteOrder = async (orderId) => {
    try {
      setLoading(true);
      await sellerService.completeOrder(orderId);
      setError('');
      await loadSellerData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to complete order');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setLoading(true);
      await sellerService.updateOrderStatus(orderId, newStatus);
      setError("");
      await loadSellerData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update order status");
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: "var(--warning-color)",
      processing: "var(--primary-color)",
      shipped: "var(--info-color)",
      delivered: "var(--success-color)",
      cancelled: "var(--danger-color)",
    };
    return statusColors[status] || "var(--gray-color)";
  };

  const getStatusOptions = (currentStatus) => {
    const statusFlow = {
      pending: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered", "cancelled"],
      delivered: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    };
    return statusFlow[currentStatus] || [];
  };

  if (!user || user.role !== "seller") {
    return (
      <div className="container">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You need to be a seller to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="seller-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Seller Dashboard</h1>
          <p>Manage your products and orders</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="dashboard-tabs">
          <button
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </button>
          <button
            className={`tab-btn ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            Products
          </button>
        </div>

        <div className="dashboard-content">
          {activeTab === "overview" && (
            <div className="overview-tab">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Orders</h3>
                  <div className="stat-value">{stats.totalOrders || 0}</div>
                  <p>All orders received</p>
                </div>

                <div className="stat-card">
                  <h3>Total Revenue</h3>
                  <div className="stat-value">
                    {formatPrice(stats.totalRevenue || 0)}
                  </div>
                  <p>From delivered orders</p>
                </div>

                {stats.statusStats?.map((stat) => (
                  <div key={stat._id} className="stat-card">
                    <h3>
                      {stat._id.charAt(0).toUpperCase() + stat._id.slice(1)}
                    </h3>
                    <div className="stat-value">{stat.count}</div>
                    <p>Orders</p>
                  </div>
                ))}
              </div>

              <div className="recent-orders">
                <h3>Recent Orders</h3>
                <div className="filter-buttons">
                  <button
                    className={`filter-btn ${filter === "all" ? "active" : ""}`}
                    onClick={() => setFilter("all")}
                  >
                    All
                  </button>
                  <button
                    className={`filter-btn ${
                      filter === "pending" ? "active" : ""
                    }`}
                    onClick={() => setFilter("pending")}
                  >
                    Pending
                  </button>
                  <button
                    className={`filter-btn ${
                      filter === "processing" ? "active" : ""
                    }`}
                    onClick={() => setFilter("processing")}
                  >
                    Processing
                  </button>
                </div>

                {orders.length > 0 ? (
                  <div className="orders-list">
                    {orders.map((order) => (
                      <div key={order._id} className="order-item">
                        <div className="order-info">
                          <span className="order-id">
                            Order #{order._id.slice(-8)}
                          </span>
                          <span className="order-date">
                            {formatDate(order.createdAt)}
                          </span>
                          <span className="customer-name">
                            {order.user?.name}
                          </span>
                        </div>

                        <div className="order-details">
                          <span className="items-count">
                            {order.items.length}{" "}
                            {order.items.length === 1 ? "item" : "items"}
                          </span>
                          <span className="order-total">
                            {formatPrice(order.total)}
                          </span>
                          <span
                            className="order-status"
                            style={{ color: getStatusColor(order.status) }}
                          >
                            {order.status}
                          </span>
                        </div>

                        <div className="order-actions">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusUpdate(order._id, e.target.value)
                            }
                            className="status-select"
                          >
                            {getStatusOptions(order.status).map((option) => (
                              <option key={option} value={option}>
                                Mark as {option}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-orders">No orders found</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="orders-tab">
              <h2>Order Management</h2>

              <div className="orders-filter">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {orders.length > 0 ? (
                <div className="orders-table">
                  <div className="table-header">
                    <span>Order ID</span>
                    <span>Date</span>
                    <span>Customer</span>
                    <span>Items</span>
                    <span>Total</span>
                    <span>Status</span>
                    <span>Actions</span>
                  </div>

                  {orders.map((order) => (
                    <div key={order._id} className="table-row">
                      <span className="order-id">#{order._id.slice(-8)}</span>
                      <span className="order-date">
                        {formatDate(order.createdAt)}
                      </span>
                      <span className="customer-name">{order.user?.name}</span>
                      <span className="items-count">
                        {order.items.length} items
                      </span>
                      <span className="order-total">
                        {formatPrice(order.total)}
                      </span>
                      <span
                        className="order-status"
                        style={{ color: getStatusColor(order.status) }}
                      >
                        {order.status}
                      </span>
                      <div className="order-actions">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusUpdate(order._id, e.target.value)
                          }
                          className="status-select"
                        >
                          {getStatusOptions(order.status).map((option) => (
                            <option key={option} value={option}>
                              {option.charAt(0).toUpperCase() + option.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-orders">
                  <p>No orders found</p>
                </div>
              )}

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        className={page === currentPage ? "active" : ""}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "products" && (
            <div className="products-tab">
              <h2>Product Management</h2>
              <p>This section will allow you to manage your products.</p>
              <a href="/create-listing" className="btn btn-primary">
                Create New Listing
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
