import api from './api';

export const productService = {
  getProducts: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    
    const response = await api.get(`/products?${queryParams}`);
    return response.data;
  },

  getProduct: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  toggleLike: async (id) => {
    const response = await api.post(`/products/${id}/like`);
    return response.data;
  },

  getFeaturedProducts: async () => {
    const response = await api.get('/products/featured');
    return response.data;
  },

  getTrendingProducts: async () => {
    const response = await api.get('/products/trending');
    return response.data;
  },

  getProductsByCategory: async (category, params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    
    const response = await api.get(`/products/category/${category}?${queryParams}`);
    return response.data;
  },

  getSimilarProducts: async (id) => {
    const response = await api.get(`/products/${id}/similar`);
    return response.data;
  }
};