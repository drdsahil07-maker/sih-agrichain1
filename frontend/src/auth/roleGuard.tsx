import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ThreeRole } from '../../../shared/types';
import { useAuth } from '../context/AuthContext';

export const ROLE_CONFIG: Record<ThreeRole, {
  name: string;
  badge: string;
  tagline: string;
  icon: string;
  dashboardPath: string;
  loginPath: string;
  registerPath: string;
  colorScheme: {
    primary: string;
    bgLight: string;
    border: string;
    text: string;
  };
}> = {
  farmer: {
    name: 'Farmer',
    badge: '🌾 Farmer',
    tagline: 'Sell your produce with transparent pricing',
    icon: 'Sprout',
    dashboardPath: '/farmer/dashboard',
    loginPath: '/login/farmer',
    registerPath: '/register/farmer',
    colorScheme: {
      primary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      bgLight: 'bg-emerald-50 text-emerald-800',
      border: 'border-emerald-200',
      text: 'text-emerald-700'
    }
  },
  distributor: {
    name: 'Distributor',
    badge: '🏪 Distributor',
    tagline: 'Source produce and manage purchases',
    icon: 'Store',
    dashboardPath: '/distributor/dashboard',
    loginPath: '/login/distributor',
    registerPath: '/register/distributor',
    colorScheme: {
      primary: 'bg-amber-600 hover:bg-amber-700 text-white',
      bgLight: 'bg-amber-50 text-amber-800',
      border: 'border-amber-200',
      text: 'text-amber-700'
    }
  },
  transporter: {
    name: 'Transporter',
    badge: '🚚 Transporter',
    tagline: 'Find loads and manage deliveries',
    icon: 'Truck',
    dashboardPath: '/transporter/dashboard',
    loginPath: '/login/transporter',
    registerPath: '/register/transporter',
    colorScheme: {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      bgLight: 'bg-blue-50 text-blue-800',
      border: 'border-blue-200',
      text: 'text-blue-700'
    }
  },
  consumer: {
    name: 'Consumer / Bulk Buyer',
    badge: '🍽️ Consumer / Bulk Buyer',
    tagline: 'Buy fresh produce directly for your business',
    icon: 'UtensilsCrossed',
    dashboardPath: '/consumer/dashboard',
    loginPath: '/login/consumer',
    registerPath: '/register/consumer',
    colorScheme: {
      primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      bgLight: 'bg-indigo-50 text-indigo-800',
      border: 'border-indigo-200',
      text: 'text-indigo-700'
    }
  },
  government_admin: {
    name: 'Government Admin',
    badge: '🏛️ Government Admin',
    tagline: 'Supply chain monitoring and insights',
    icon: 'Landmark',
    dashboardPath: '/government',
    loginPath: '/login/government',
    registerPath: '/register/government',
    colorScheme: {
      primary: 'bg-slate-800 hover:bg-slate-900 text-white',
      bgLight: 'bg-slate-100 text-slate-800',
      border: 'border-slate-300',
      text: 'text-slate-800'
    }
  }
};

export function getDashboardPath(role: ThreeRole): string {
  return ROLE_CONFIG[role]?.dashboardPath || '/';
}

export function getLoginPath(role: ThreeRole): string {
  return ROLE_CONFIG[role]?.loginPath || '/choose-role';
}

export function getRegisterPath(role: ThreeRole): string {
  return ROLE_CONFIG[role]?.registerPath || '/choose-role';
}

export function validateRoleAccess(requiredRole: ThreeRole, currentRole: ThreeRole | null): {
  authorized: boolean;
  redirectPath?: string;
} {
  // If no authenticated user, redirect to /choose-role
  if (!currentRole) {
    return {
      authorized: false,
      redirectPath: '/choose-role'
    };
  }

  // If authenticated user has a different role, redirect them to their own dashboard
  if (currentRole !== requiredRole) {
    return {
      authorized: false,
      redirectPath: getDashboardPath(currentRole)
    };
  }

  return { authorized: true };
}

// RoleGuard component
export const RoleGuard: React.FC<{
  allowedRoles: ThreeRole[];
  children: React.ReactNode;
}> = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-700">Verifying role permissions...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/choose-role" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <>{children}</>;
};
