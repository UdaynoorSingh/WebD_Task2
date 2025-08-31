import api from './api';

export const sellerService = {
  getSellerOrders: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    
    const response = await api.get(`/seller/orders?${queryParams}`);
    return response.data;
  },

  getSellerStats: async () => {
    const response = await api.get('/seller/orders/stats');
    return response.data;
  },

  updateOrderStatus: async (orderId, status) => {
    const response = await api.patch(`/seller/orders/${orderId}/status`, { status });
    return response.data;
  },

    completeOrder: async (orderId) => {
    const response = await api.patch(`/seller/orders/${orderId}/complete`);
    return response.data;
  },

  getSellerReviews: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    
    const response = await api.get(`/seller/reviews?${queryParams}`);
    return response.data;
  },

  getSellerOrder: async (orderId) => {
    const response = await api.get(`/seller/orders/${orderId}`);
    return response.data;
  }
};