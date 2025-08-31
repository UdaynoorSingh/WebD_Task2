import api from "./api";

export const userService = {
  uploadAvatar: async (formData) => {
    const response = await api.post("/upload/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  getUserProfile: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  getUserProducts: async (userId, params = {}) => {
    const queryParams = new URLSearchParams();

    Object.keys(params).forEach((key) => {
      if (
        params[key] !== undefined &&
        params[key] !== null &&
        params[key] !== ""
      ) {
        queryParams.append(key, params[key]);
      }
    });

    const response = await api.get(`/users/${userId}/products?${queryParams}`);
    return response.data;
  },

  getUserReviews: async (userId, params = {}) => {
    const queryParams = new URLSearchParams();

    Object.keys(params).forEach((key) => {
      if (
        params[key] !== undefined &&
        params[key] !== null &&
        params[key] !== ""
      ) {
        queryParams.append(key, params[key]);
      }
    });

    const response = await api.get(`/users/${userId}/reviews?${queryParams}`);
    return response.data;
  },

    getFavorites: async () => {
    try {
      const response = await api.get('/users/favorites/me');
      
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.favorites)) {
        return response.data.favorites;
      } else {
        console.error('Unexpected favorites response format:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      
      if (error.response && error.response.status === 404) {
        console.log('Favorites endpoint not found, trying alternative endpoint...');
      }
      
      return [];
    }
  },

  checkFavorite: async (productId) => {
    try {
      const response = await api.get(`/users/favorites/check/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return { isFavorite: false };
    }
  },

  addToFavorites: async (productId) => {
    try {
      const response = await api.post(`/users/favorites/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      const errorMessage = error.response?.data?.error || 'Failed to add to favorites';
      throw new Error(errorMessage);
    }
  },

  removeFromFavorites: async (productId) => {
    try {
      const response = await api.delete(`/users/favorites/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      const errorMessage = error.response?.data?.error || 'Failed to remove from favorites';
      throw new Error(errorMessage);
    }
  }
};