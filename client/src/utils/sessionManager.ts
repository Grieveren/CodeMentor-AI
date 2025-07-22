import { useAuthStore } from '@/store/authStore';
import { isTokenExpired } from './tokenManager';
import { handleSessionExpired } from './logout';

/**
 * Session management utilities
 */

export class SessionManager {
  private checkInterval: number | null = null;
  private readonly CHECK_INTERVAL = 60000; // Check every minute
  private readonly WARNING_THRESHOLD = 300000; // Warn 5 minutes before expiry

  /**
   * Start session monitoring
   */
  start(): void {
    this.stop(); // Clear any existing interval

    this.checkInterval = setInterval(() => {
      this.checkSession();
    }, this.CHECK_INTERVAL);

    // Initial check
    this.checkSession();
  }

  /**
   * Stop session monitoring
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Check current session status
   */
  private checkSession(): void {
    const { token, refreshToken, isAuthenticated } = useAuthStore.getState();

    if (!isAuthenticated || !token) {
      return;
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      if (refreshToken) {
        // Try to refresh the token
        this.refreshSession();
      } else {
        // No refresh token, session expired
        handleSessionExpired('Token expired and no refresh token available');
      }
      return;
    }

    // Check if token is expiring soon (optional warning)
    const timeUntilExpiry = this.getTimeUntilExpiry(token);
    if (timeUntilExpiry > 0 && timeUntilExpiry < this.WARNING_THRESHOLD) {
      this.handleSessionWarning(timeUntilExpiry);
    }
  }

  /**
   * Refresh the current session
   */
  private async refreshSession(): Promise<void> {
    try {
      const { refreshAuth } = useAuthStore.getState();
      await refreshAuth();
    } catch (error) {
      console.error('Session refresh failed:', error);
      handleSessionExpired('Failed to refresh session');
    }
  }

  /**
   * Get time until token expiry (in milliseconds)
   */
  private getTimeUntilExpiry(token: string): number {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      return expiryTime - Date.now();
    } catch (error) {
      console.error('Error parsing token expiry:', error);
      return 0;
    }
  }

  /**
   * Handle session expiry warning
   */
  private handleSessionWarning(timeUntilExpiry: number): void {
    const minutes = Math.floor(timeUntilExpiry / 60000);
    console.warn(`Session expires in ${minutes} minutes`);

    // You could show a toast notification or modal here
    // For now, we'll just log it
  }

  /**
   * Force session refresh
   */
  async forceRefresh(): Promise<void> {
    await this.refreshSession();
  }

  /**
   * Check if session is valid
   */
  isSessionValid(): boolean {
    const { token, isAuthenticated } = useAuthStore.getState();
    return isAuthenticated && token !== null && !isTokenExpired(token);
  }
}

// Global session manager instance
export const sessionManager = new SessionManager();

/**
 * Hook for session management
 */
export const useSessionManager = () => {
  return {
    startMonitoring: () => sessionManager.start(),
    stopMonitoring: () => sessionManager.stop(),
    forceRefresh: () => sessionManager.forceRefresh(),
    isSessionValid: () => sessionManager.isSessionValid(),
  };
};

/**
 * Initialize session management
 * Call this when the app starts
 */
export const initializeSessionManagement = (): void => {
  // Start session monitoring
  sessionManager.start();

  // Handle visibility change (pause/resume monitoring)
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page is hidden, we could pause monitoring
        // For now, we'll keep it running
      } else {
        // Page is visible, ensure monitoring is active
        sessionManager.start();
      }
    });
  }

  // Handle online/offline events
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      // Back online, restart monitoring
      sessionManager.start();
    });

    window.addEventListener('offline', () => {
      // Offline, pause monitoring
      sessionManager.stop();
    });
  }
};
