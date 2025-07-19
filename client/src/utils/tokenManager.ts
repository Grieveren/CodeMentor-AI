import { useAuthStore } from '@/store/authStore';

/**
 * Token management utilities for handling JWT tokens
 */

/**
 * Check if a JWT token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error parsing token:', error);
    return true;
  }
};

/**
 * Get time until token expires (in seconds)
 */
export const getTokenExpirationTime = (token: string): number => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return Math.max(0, payload.exp - currentTime);
  } catch (error) {
    console.error('Error parsing token:', error);
    return 0;
  }
};

/**
 * Schedule automatic token refresh
 * Refreshes token 5 minutes before expiration
 */
export const scheduleTokenRefresh = (token: string): NodeJS.Timeout | null => {
  const expirationTime = getTokenExpirationTime(token);
  const refreshTime = Math.max(0, (expirationTime - 300) * 1000); // 5 minutes before expiration
  
  if (refreshTime <= 0) {
    return null;
  }

  return setTimeout(() => {
    const { refreshAuth } = useAuthStore.getState();
    refreshAuth().catch((error) => {
      console.error('Scheduled token refresh failed:', error);
    });
  }, refreshTime);
};

/**
 * Get authorization header for API requests
 */
export const getAuthHeader = (): Record<string, string> => {
  const { token } = useAuthStore.getState();
  
  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Check if current token is valid and not expired
 */
export const isValidToken = (): boolean => {
  const { token } = useAuthStore.getState();
  
  if (!token) {
    return false;
  }

  return !isTokenExpired(token);
};

/**
 * Token refresh manager class
 * Handles automatic token refresh scheduling
 */
export class TokenRefreshManager {
  private refreshTimeout: NodeJS.Timeout | null = null;

  /**
   * Start automatic token refresh scheduling
   */
  start(token: string): void {
    this.stop(); // Clear any existing timeout
    this.refreshTimeout = scheduleTokenRefresh(token);
  }

  /**
   * Stop automatic token refresh scheduling
   */
  stop(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  /**
   * Restart token refresh scheduling with new token
   */
  restart(token: string): void {
    this.start(token);
  }
}

// Global token refresh manager instance
export const tokenRefreshManager = new TokenRefreshManager();