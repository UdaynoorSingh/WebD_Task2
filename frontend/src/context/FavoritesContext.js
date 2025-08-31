import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { userService } from '../services/userService';

const FavoritesContext = createContext();

const favoritesReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FAVORITES':
      return { ...state, items: action.payload, loading: false };
    case 'ADD_FAVORITE':
      return { ...state, items: [...state.items, action.payload] };
    case 'REMOVE_FAVORITE':
      return {
        ...state,
        items: state.items.filter(item => item._id !== action.payload)
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const useFavorites = () => {
  return useContext(FavoritesContext);
};

export const FavoritesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(favoritesReducer, {
    items: [],
    loading: false,
    error: null
  });

  const { user } = useAuth();

  const loadFavorites = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const favorites = await userService.getFavorites();
      dispatch({ type: 'SET_FAVORITES', payload: favorites });
    } catch (error) {
      console.error("Error loading favorites:", error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to load favorites' });
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      dispatch({ type: 'SET_FAVORITES', payload: [] });
    }
  }, [user, loadFavorites]);

  const addToFavorites = async (product) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      await userService.addToFavorites(product._id);
      dispatch({ type: 'ADD_FAVORITE', payload: product });
      return true;
    } catch (error) {
      console.error("Error adding to favorites:", error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to add to favorites' });
      return false;
    }
  };

  const removeFromFavorites = async (productId) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      await userService.removeFromFavorites(productId);
      dispatch({ type: 'REMOVE_FAVORITE', payload: productId });
      return true;
    } catch (error) {
      console.error("Error removing from favorites:", error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to remove from favorites' });
      return false;
    }
  };

  const isFavorite = (productId) => {
    return state.items.some(item => item._id === productId);
  };

  const value = {
    items: state.items,
    loading: state.loading,
    error: state.error,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    loadFavorites
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};