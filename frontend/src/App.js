import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import Header from './components/common/Header/Header';
import Footer from './components/common/Footer/Footer';
import AppRoutes from './AppRoutes';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <Router>
            <div className="App">
              <Header />
              <main className="main-content">
                <AppRoutes />
              </main>
              <Footer />
            </div>
          </Router>
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;