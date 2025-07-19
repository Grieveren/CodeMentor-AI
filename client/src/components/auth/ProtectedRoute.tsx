import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAuthContext } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/Spinner';
import type { User } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: User['role'];
  requiredRoles?: User['role'][];
  fallbackPath?: string;
  showSpinner?: boolean;
}

/**
 * ProtectedRoute component that handles authentication and authorization
 * Redirects to login if not authenticated, preserving the intended destination
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredRoles,
  fallbackPath = '/auth/login',
  showSpinner = true,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { isInitialized } = useAuthContext();
  const location = useLocation();

  // Show loading spinner while auth is initializing or loading
  if (!isInitialized || isLoading) {
    return showSpinner ? (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    ) : null;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to={fallbackPath}
        state={{ 
          from: location.pathname + location.search,
          message: 'Please sign in to access this page'
        }}
        replace
      />
    );
  }

  // Check role-based authorization
  if (requiredRole && user.role !== requiredRole) {
    return (
      <Navigate
        to="/unauthorized"
        state={{ 
          from: location.pathname + location.search,
          message: `Access denied. Required role: ${requiredRole}`
        }}
        replace
      />
    );
  }

  // Check multiple roles authorization
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return (
      <Navigate
        to="/unauthorized"
        state={{ 
          from: location.pathname + location.search,
          message: `Access denied. Required roles: ${requiredRoles.join(', ')}`
        }}
        replace
      />
    );
  }

  // Render protected content
  return <>{children}</>;
};

/**
 * Higher-order component for protecting routes
 */
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  );

  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
  return WrappedComponent;
};