import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RestaurantPage from './pages/RestaurantPage';
import OrdersPage from './pages/OrdersPage';
import ActiveOrderWidget from './components/ActiveOrderWidget';
import OrderTrackingPage from './pages/OrderTrackingPage';
import SearchResultsPage from './pages/searchResultPage';
import './App.css';
import './services/api'

import HomePage from './pages/HomePage';
import RestaurantsPage from './pages/RestaurantsPage';


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="app-container">
            <Navbar />
            <ActiveOrderWidget />
            <main>
              <Routes>
                {/* ראוט 1: דף הבית (הכותרת הגדולה בלבד) */}
                <Route path="/" element={<HomePage />} />
                
                {/* ראוט 2: דף המסעדות (אליו הכפתור יעביר אותנו) */}
                <Route path="/restaurants" element={<RestaurantsPage />} />
                
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/restaurant/:id" element={<RestaurantPage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/tracking/:orderId" element={
                  <ProtectedRoute>
                    <OrderTrackingPage />
                  </ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute>
                    <OrdersPage />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;