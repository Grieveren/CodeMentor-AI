import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import type { User } from '@/types';

/**
 * Custom hook for authentication state and actions
 * Provides easy access to auth state and methods for components
 */
export const useAuth = () => {
  const {
    user,
    token,
    refreshToken,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshAuth,
    clearError,
    setLoading,
  } = useAuthStore();

  // Auto-refresh token on mount if we have a refresh token
  useEffect(() => {
    if (refreshToken && !token) {
      refreshAuth();
    }
  }, [refreshToken, token, refreshAuth]);

  return {
    // State
    user,
    token,
    refreshToken,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    login,
    register,
    logout,
    refreshAuth,
    clearError,
    setLoading,
  };
};

/**
 * Hook to get current user information
 * Returns null if not authenticated
 */
export const useCurrentUser = (): User | null => {
  const user = useAuthStore((state) => state.user);
  return user;
};

/**
 * Hook to check if user has specific role
 */
export const useHasRole = (role: User['role']): boolean => {
  const user = useAuthStore((state) => state.user);
  return user?.role === role;
};

/**
 * Hook to check if user has any of the specified roles
 */
export const useHasAnyRole = (roles: User['role'][]): boolean => {
  const user = useAuthStore((state) => state.user);
  return user ? roles.includes(user.role) : false;
};

/**
 * Hook for authentication status
 * Useful for conditional rendering
 */
export const useAuthStatus = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  
  return {
    isAuthenticated,
    isLoading,
    isUnauthenticated: !isAuthenticated && !isLoading,
  };
};