import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* A page that needs an account. Signing in should return you to the page
   you asked for, so the destination travels with the redirect and
   LoginPage reads it back out of `location.state.from`. */

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  return children;
}
