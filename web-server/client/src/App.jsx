import { useEffect, useRef } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/ui';
import TopBar from './components/layout/TopBar';
import AppFooter from './components/layout/AppFooter';
import ProtectedRoute from './components/ProtectedRoute';
import ActiveOrderWidget from './components/ActiveOrderWidget';
import HomePage from './pages/HomePage';
import RestaurantsPage from './pages/RestaurantsPage';
import RestaurantPage from './pages/RestaurantPage';
import SearchResultsPage from './pages/SearchResultsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrdersPage from './pages/OrdersPage';
import WorldCupPage from './pages/WorldCupPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import NotFoundPage from './pages/NotFoundPage';

/* A route change swaps the page under the element that had focus, which
   leaves the keyboard on <body> and tells a screen reader nothing. Focus
   moves to <main> instead, from where Tab starts at the new page's top.
   Rendered before the page, so a page that places focus itself (the login
   form's first field) still has the last word. Not on first load, and not
   when only the query changes (typing a new search). */
function RouteFocus() {
  const { pathname } = useLocation();
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    document.getElementById('main')?.focus({ preventScroll: true });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <div className="bw-app">
              <RouteFocus />
              <a className="bw-skip-link" href="#main">
                דילוג לתוכן הראשי
              </a>

              <ActiveOrderWidget />
              <TopBar />

              <main id="main" tabIndex={-1}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/restaurants" element={<RestaurantsPage />} />
                  <Route path="/restaurant/:id" element={<RestaurantPage />} />
                  <Route path="/search" element={<SearchResultsPage />} />
                  <Route path="/world-cup" element={<WorldCupPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute>
                        <OrdersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/tracking/:orderId"
                    element={
                      <ProtectedRoute>
                        <OrderTrackingPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>

              <AppFooter />
            </div>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
