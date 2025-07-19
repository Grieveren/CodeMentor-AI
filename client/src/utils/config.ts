import type { AppConfig } from '@/types';

/**
 * Application configuration loaded from environment variables
 */
export const config: AppConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  wsBaseUrl: import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:3001',
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10),
  appName: import.meta.env.VITE_APP_NAME || 'CodeMentor AI',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: import.meta.env.VITE_APP_ENVIRONMENT || 'development',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  githubClientId: import.meta.env.VITE_GITHUB_CLIENT_ID,
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
};

/**
 * Check if the app is running in development mode
 */
export const isDevelopment = config.environment === 'development';

/**
 * Check if the app is running in production mode
 */
export const isProduction = config.environment === 'production';

/**
 * Log configuration in development mode
 */
if (isDevelopment && config.enableDebug) {
  console.log('App Configuration:', config);
}