import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  // אם המשתמש לא מחובר, ננווט אותו בכוח לעמוד ההתחברות
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // אם הוא מחובר, נציג את התוכן המבוקש
  return children;
};

export default ProtectedRoute;