import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return { ...state, items: action.payload, loading: false };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item._id === action.payload._id ? action.payload : item
        )
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item._id !== action.payload)
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    loading: false,
    error: null
  });

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [user]);

  const loadCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const cart = await cartService.getCart();
      dispatch({ type: 'SET_CART', payload: cart.items });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const cart = await cartService.addToCart(productId, quantity);
      dispatch({ type: 'SET_CART', payload: cart.items });
      return cart;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const cart = await cartService.updateQuantity(itemId, quantity);
      dispatch({ type: 'SET_CART', payload: cart.items });
      return cart;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const cart = await cartService.removeFromCart(itemId);
      dispatch({ type: 'SET_CART', payload: cart.items });
      return cart;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const getCartTotal = () => {
    return state.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const getCartItemsCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    items: state.items,
    loading: state.loading,
    error: state.error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    loadCart,
    getCartTotal,
    getCartItemsCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};