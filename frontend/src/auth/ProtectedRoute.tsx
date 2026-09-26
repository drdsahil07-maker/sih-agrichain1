import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ThreeRole } from '../../../shared/types';
import { useAuth } from '../context/AuthContext';
import { validateRoleAccess } from './roleGuard';

interface ProtectedRouteProps {
  requiredRole?: ThreeRole;
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole, children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-700">Verifying account session...</span>
        </div>
      </div>
    );
  }

  // If there is no authenticated user, redirect to /choose-role
  if (!user) {
    return <Navigate to="/choose-role" state={{ from: location }} replace />;
  }

  // If a specific role is required, validate access
  if (requiredRole) {
    const access = validateRoleAccess(requiredRole, user.role);
    if (!access.authorized && access.redirectPath) {
      return <Navigate to={access.redirectPath} replace />;
    }
  }

  return <>{children}</>;
};
