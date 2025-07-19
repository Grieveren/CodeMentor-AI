import { apiClient } from './apiClient';
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  TokenResponse,
  User,
} from '@/types';

export class AuthService {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', userData);
    return response.data;
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/api/auth/refresh', {
      refreshToken,
    });
    return response.data;
  }

  /**
   * Logout user (invalidate tokens)
   */
  async logout(): Promise<void> {
    await apiClient.post('/api/auth/logout');
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/api/auth/me');
    return response.data;
  }

  /**
   * Update user profile
   */
  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiClient.patch<User>('/api/auth/profile', userData);
    return response.data;
  }

  /**
   * Change user password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/api/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post('/api/auth/forgot-password', { email });
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/api/auth/reset-password', {
      token,
      newPassword,
    });
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<void> {
    await apiClient.post('/api/auth/verify-email', { token });
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification(): Promise<void> {
    await apiClient.post('/api/auth/resend-verification');
  }

  /**
   * OAuth login with GitHub
   */
  async loginWithGitHub(code: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/oauth/github', {
      code,
    });
    return response.data;
  }

  /**
   * OAuth login with Google
   */
  async loginWithGoogle(code: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/oauth/google', {
      code,
    });
    return response.data;
  }

  /**
   * Get OAuth authorization URL
   */
  async getOAuthUrl(provider: 'github' | 'google'): Promise<string> {
    const response = await apiClient.get<{ url: string }>(`/api/auth/oauth/${provider}/url`);
    return response.data.url;
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;