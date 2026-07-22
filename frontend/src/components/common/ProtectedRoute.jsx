import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function ProtectedRoute({ children, requiredRoles }) {
  const { isAuthenticated, canAccess, loading } = useAuth();

  if (loading) return <div className="p-8 text-slate-500">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRoles && !canAccess(requiredRoles)) return <Navigate to="/unauthorized" replace />;

  return children;
}
