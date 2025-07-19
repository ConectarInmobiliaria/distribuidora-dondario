import { useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, roles: allowed }) {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  if (allowed && !allowed.some(r => user.roles.includes(r)))
    return <Navigate to="/login" />;
  return children;
}
