/**
 * Application configuration loaded from environment variables
 */
export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
    wsBaseUrl: import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:3001',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10),
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'CodeMentor AI',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.VITE_APP_ENVIRONMENT || 'development',
  },
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    debug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
    aiAssistance: import.meta.env.VITE_ENABLE_AI_ASSISTANCE === 'true',
    collaboration: import.meta.env.VITE_ENABLE_COLLABORATION === 'true',
    realTimeEditing: import.meta.env.VITE_ENABLE_REAL_TIME_EDITING === 'true',
  },
  editor: {
    monacoEditorCdn: import.meta.env.VITE_MONACO_EDITOR_CDN || 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0',
    maxDocumentSize: parseInt(import.meta.env.VITE_MAX_DOCUMENT_SIZE || '1048576', 10), // 1MB
    autoSaveInterval: parseInt(import.meta.env.VITE_AUTO_SAVE_INTERVAL || '30000', 10), // 30 seconds
    validationDebounce: parseInt(import.meta.env.VITE_VALIDATION_DEBOUNCE || '1000', 10), // 1 second
  },
  ai: {
    serviceUrl: import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:3001/api/ai',
    reviewTimeout: parseInt(import.meta.env.VITE_AI_REVIEW_TIMEOUT || '30000', 10), // 30 seconds
    suggestionsEnabled: import.meta.env.VITE_AI_SUGGESTIONS_ENABLED === 'true',
  },
  collaboration: {
    timeout: parseInt(import.meta.env.VITE_COLLABORATION_TIMEOUT || '5000', 10), // 5 seconds
    maxCollaborators: parseInt(import.meta.env.VITE_MAX_COLLABORATORS || '10', 10),
  },
  auth: {
    githubClientId: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
    googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  },
  external: {
    sentryDsn: import.meta.env.VITE_SENTRY_DSN || '',
    googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '',
  },
} as const;

/**
 * Check if the app is running in development mode
 */
export const isDevelopment = config.app.environment === 'development';

/**
 * Check if the app is running in production mode
 */
export const isProduction = config.app.environment === 'production';

/**
 * Type-safe environment variable access
 */
export const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key];
  if (value === undefined && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value || defaultValue || '';
};

/**
 * Validation helpers
 */
export const validateConfig = (): void => {
  const requiredVars = [
    'VITE_API_BASE_URL',
  ];

  const missing = requiredVars.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing);
  }

  // Validate numeric values
  if (isNaN(config.api.timeout)) {
    console.warn('Invalid VITE_API_TIMEOUT, using default');
  }
  
  if (isNaN(config.editor.maxDocumentSize)) {
    console.warn('Invalid VITE_MAX_DOCUMENT_SIZE, using default');
  }
  
  if (isNaN(config.editor.autoSaveInterval)) {
    console.warn('Invalid VITE_AUTO_SAVE_INTERVAL, using default');
  }
};

/**
 * Log configuration in development mode
 */
if (isDevelopment && config.features.debug) {
  console.log('App Configuration:', config);
  validateConfig();
}