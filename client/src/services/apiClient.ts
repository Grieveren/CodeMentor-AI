import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { config as appConfig } from '@/utils/config';
import type { ApiResponse, ApiError } from '@/types';

// Request retry configuration
interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition: (error: AxiosError) => boolean;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  retries: 3,
  retryDelay: 1000,
  retryCondition: (error: AxiosError) => {
    // Retry on network errors or 5xx server errors
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  },
};

class ApiClient {
  private axiosInstance: AxiosInstance;
  private retryConfig: RetryConfig;

  constructor() {
    this.retryConfig = DEFAULT_RETRY_CONFIG;
    this.axiosInstance = axios.create({
      baseURL: appConfig.api.baseUrl,
      timeout: appConfig.api.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for authentication and logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add authentication token if available
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request in development
        if (appConfig.features.debug) {
          console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
            headers: config.headers,
            data: config.data,
          });
        }

        return config;
      },
      (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling and logging
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log response in development
        if (appConfig.features.debug) {
          console.log(`[API Response] ${response.status} ${response.config.url}`, {
            data: response.data,
          });
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Log error in development
        if (appConfig.features.debug) {
          console.error(`[API Error] ${error.response?.status} ${originalRequest?.url}`, {
            error: error.response?.data,
            message: error.message,
          });
        }

        // Handle 401 Unauthorized - attempt token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await this.refreshToken();
            // Retry the original request with new token
            const token = this.getAuthToken();
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.handleAuthFailure();
            return Promise.reject(refreshError);
          }
        }

        // Handle retry logic for retryable errors
        if (this.shouldRetry(error) && !originalRequest._retry) {
          return this.retryRequest(originalRequest, error);
        }

        // Transform error to our standard format
        const apiError = this.transformError(error);
        return Promise.reject(apiError);
      }
    );
  }

  private getAuthToken(): string | null {
    // Get token from localStorage (where Zustand persists it)
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        return parsed.state?.token || null;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return null;
  }

  private async refreshToken(): Promise<void> {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (!authStorage) {
        throw new Error('No auth storage found');
      }

      const parsed = JSON.parse(authStorage);
      const refreshToken = parsed.state?.refreshToken;

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(`${appConfig.api.baseUrl}/api/auth/refresh`, {
        refreshToken,
      });

      const { token, refreshToken: newRefreshToken } = response.data;

      // Update tokens in localStorage
      parsed.state.token = token;
      parsed.state.refreshToken = newRefreshToken;
      localStorage.setItem('auth-storage', JSON.stringify(parsed));
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  private handleAuthFailure(): void {
    // Clear auth storage
    localStorage.removeItem('auth-storage');
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  private shouldRetry(error: AxiosError): boolean {
    return this.retryConfig.retryCondition(error);
  }

  private async retryRequest(
    originalRequest: AxiosRequestConfig,
    error: AxiosError
  ): Promise<AxiosResponse> {
    let retryCount = 0;
    const maxRetries = this.retryConfig.retries;

    while (retryCount < maxRetries) {
      retryCount++;
      
      // Wait before retrying
      await new Promise(resolve => 
        setTimeout(resolve, this.retryConfig.retryDelay * retryCount)
      );

      try {
        console.log(`[API Retry] Attempt ${retryCount}/${maxRetries} for ${originalRequest.url}`);
        return await this.axiosInstance(originalRequest);
      } catch (retryError) {
        if (retryCount === maxRetries) {
          throw retryError;
        }
      }
    }

    throw error;
  }

  private transformError(error: AxiosError): ApiError {
    const apiError: ApiError = {
      message: 'An unexpected error occurred',
    };

    if (error.response?.status) {
      apiError.status = error.response.status;
    }

    if (error.response?.data) {
      const responseData = error.response.data as any;
      apiError.message = responseData.message || responseData.error || apiError.message;
      apiError.code = responseData.code;
      apiError.details = responseData.details;
    } else if (error.request) {
      apiError.message = 'Network error - please check your connection';
    } else {
      apiError.message = error.message;
    }

    return apiError;
  }

  // Public methods for making requests
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  public async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // Get the raw axios instance for special cases
  public getInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  // Update retry configuration
  public setRetryConfig(config: Partial<RetryConfig>): void {
    this.retryConfig = { ...this.retryConfig, ...config };
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();
export default apiClient;