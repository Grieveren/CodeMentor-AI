import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { tokenRefreshManager, isValidToken } from '@/utils/tokenManager';
import { sessionManager } from '@/utils/sessionManager';

/**
 * Authentication context for providing auth state throughout the app
 */
interface AuthContextType {
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication provider component
 * Handles token refresh scheduling and auth initialization
 */
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { token, refreshToken, isAuthenticated, refreshAuth, clearAuth } = useAuthStore();
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Initialize authentication state on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // If we have tokens but no valid access token, try to refresh
        if (refreshToken && (!token || !isValidToken())) {
          await refreshAuth();
        }
        // If we have an invalid refresh token, clear auth
        else if (token && !isValidToken() && !refreshToken) {
          clearAuth();
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        clearAuth();
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [token, refreshToken, refreshAuth, clearAuth]);

  // Handle token refresh scheduling and session management
  useEffect(() => {
    if (isAuthenticated && token && isValidToken()) {
      // Start automatic token refresh
      tokenRefreshManager.start(token);
      // Start session monitoring
      sessionManager.start();
    } else {
      // Stop token refresh and session monitoring if not authenticated or token is invalid
      tokenRefreshManager.stop();
      sessionManager.stop();
    }

    // Cleanup on unmount
    return () => {
      tokenRefreshManager.stop();
      sessionManager.stop();
    };
  }, [isAuthenticated, token]);

  // Handle storage events (for multi-tab synchronization)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'auth-storage') {
        // Force re-render when auth state changes in another tab
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const contextValue: AuthContextType = {
    isInitialized,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use the authentication context
 */
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};