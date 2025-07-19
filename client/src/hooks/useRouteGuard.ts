import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import type { User } from '@/types';

interface RouteGuardOptions {
  requireAuth?: boolean;
  requiredRole?: User['role'];
  requiredRoles?: User['role'][];
  redirectTo?: string;
  onUnauthorized?: (reason: string) => void;
}

/**
 * Hook for programmatic route guarding
 * Useful for protecting routes without wrapping components
 */
export const useRouteGuard = (options: RouteGuardOptions = {}) => {
  const {
    requireAuth = true,
    requiredRole,
    requiredRoles,
    redirectTo = '/auth/login',
    onUnauthorized,
  } = options;

  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't check while still loading
    if (isLoading) return;

    // Check authentication requirement
    if (requireAuth && !isAuthenticated) {
      const reason = 'Authentication required';
      onUnauthorized?.(reason);
      navigate(redirectTo, {
        state: { 
          from: location.pathname + location.search,
          message: 'Please sign in to access this page'
        },
        replace: true,
      });
      return;
    }

    // Check role requirements (only if authenticated)
    if (isAuthenticated && user) {
      if (requiredRole && user.role !== requiredRole) {
        const reason = `Required role: ${requiredRole}`;
        onUnauthorized?.(reason);
        navigate('/unauthorized', {
          state: { 
            from: location.pathname + location.search,
            message: `Access denied. ${reason}`
          },
          replace: true,
        });
        return;
      }

      if (requiredRoles && !requiredRoles.includes(user.role)) {
        const reason = `Required roles: ${requiredRoles.join(', ')}`;
        onUnauthorized?.(reason);
        navigate('/unauthorized', {
          state: { 
            from: location.pathname + location.search,
            message: `Access denied. ${reason}`
          },
          replace: true,
        });
        return;
      }
    }
  }, [
    isAuthenticated,
    user,
    isLoading,
    requireAuth,
    requiredRole,
    requiredRoles,
    redirectTo,
    onUnauthorized,
    navigate,
    location.pathname,
    location.search,
  ]);

  return {
    isAuthorized: isAuthenticated && (!requiredRole || user?.role === requiredRole) && 
                  (!requiredRoles || (user && requiredRoles.includes(user.role))),
    isLoading,
  };
};