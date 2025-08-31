import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoadingSpinner from './components/common/LoadingSpinner/LoadingSpinner';

import Home from './pages/Home/Home';
import Marketplace from './pages/Marketplace/Marketplace';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import UserDashboard from './pages/UserDashboard/UserDashboard';
import CreateListing from './pages/CreateListing/CreateListing';
import Favorites from './pages/Favorites/Favorites';
import Transactions from './pages/Transactions/Transactions';
import NotFound from './pages/NotFound/NotFound';
import UserProfile from './pages/UserProfile/UserProfile';
import CheckoutSuccess from './pages/CheckoutSuccess/CheckoutSuccess';
import SellerDashboard from './pages/SellerDashboard/SellerDashboard';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {user && (
        <>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/create-listing" element={<CreateListing />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/seller-dashboard" element={<SellerDashboard />} />
        </>
      )}
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;