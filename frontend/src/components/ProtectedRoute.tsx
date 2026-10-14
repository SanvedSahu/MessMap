import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: UserRole | UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { user, isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    if (allowedRole === 'admin' || (Array.isArray(allowedRole) && allowedRole.includes('admin'))) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    const targetRole = Array.isArray(allowedRole) ? allowedRole[0] : allowedRole;
    return <Navigate to={`/login?role=${targetRole || 'student'}`} state={{ from: location }} replace />;
  }

  if (allowedRole) {
    const roles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
    if (!roles.includes(role)) {
      if (roles.includes('admin')) {
        return <Navigate to="/admin/login" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};
