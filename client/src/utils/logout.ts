import { useAuthStore } from '@/store/authStore';
import { tokenRefreshManager } from './tokenManager';

/**
 * Logout utility functions for proper session cleanup
 */

/**
 * Perform complete logout with cleanup
 */
export const performLogout = async (options?: {
  redirectTo?: string;
  clearStorage?: boolean;
  notifyServer?: boolean;
}) => {
  const {
    redirectTo = '/auth/login',
    clearStorage = true,
    notifyServer = true,
  } = options || {};

  try {
    // Get current auth state
    const { token, clearAuth } = useAuthStore.getState();

    // Notify server about logout (optional)
    if (notifyServer && token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        // Ignore server errors during logout
        console.warn('Server logout notification failed:', error);
      }
    }

    // Stop token refresh manager
    tokenRefreshManager.stop();

    // Clear auth state
    clearAuth();

    // Clear additional storage if requested
    if (clearStorage) {
      // Clear any cached data
      sessionStorage.clear();
      
      // Clear specific localStorage items (keep user preferences)
      const keysToRemove = [
        'auth-storage',
        'oauth_redirect_url',
        'temp_auth_data',
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
    }

    // Redirect to specified location
    if (redirectTo && typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
  } catch (error) {
    console.error('Logout error:', error);
    // Force clear auth state even if there's an error
    useAuthStore.getState().clearAuth();
    tokenRefreshManager.stop();
  }
};

/**
 * Logout hook for components
 */
export const useLogout = () => {
  const logout = (options?: Parameters<typeof performLogout>[0]) => {
    return performLogout(options);
  };

  return { logout };
};

/**
 * Auto-logout on token expiration or invalid session
 */
export const handleSessionExpired = (reason?: string) => {
  console.warn('Session expired:', reason);
  
  // Show user-friendly message
  if (typeof window !== 'undefined') {
    // You could show a toast notification here
    console.log('Your session has expired. Please sign in again.');
  }

  // Perform logout without server notification (session already invalid)
  performLogout({
    notifyServer: false,
    redirectTo: '/auth/login',
  });
};

/**
 * Logout on window/tab close (optional cleanup)
 */
export const setupLogoutOnClose = () => {
  if (typeof window === 'undefined') return;

  const handleBeforeUnload = () => {
    // Only clear sensitive data, not full logout
    const { token } = useAuthStore.getState();
    if (token) {
      // Clear sensitive session data
      sessionStorage.removeItem('temp_auth_data');
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);

  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
};