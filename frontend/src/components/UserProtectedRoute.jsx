import { Navigate } from 'react-router-dom';

const UserProtectedRoute = ({ children }) => {
  // Check if user is authenticated
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (!token || !user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default UserProtectedRoute;
