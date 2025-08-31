import api from './api';
import { v4 as uuidv4 } from 'uuid';

export const checkoutService = {
  processCheckout: async (checkoutData) => {
    const idempotencyKey = uuidv4();
    
    const response = await api.post('/checkout', checkoutData, {
      headers: {
        'Idempotency-Key': idempotencyKey
      }
    });
    
    return response.data;
  },

  getOrderHistory: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    
    const response = await api.get(`/checkout/orders?${queryParams}`);
    return response.data;
  },

  getOrderDetails: async (orderId) => {
    const response = await api.get(`/checkout/orders/${orderId}`);
    return response.data;
  },

  updateOrderStatus: async (orderId, status) => {
    const response = await api.patch(`/checkout/orders/${orderId}/status`, { status });
    return response.data;
  }
};