/**
 * Mock configuration for Jest tests
 */
export const config = {
  api: {
    baseUrl: 'http://localhost:3001',
    wsBaseUrl: 'ws://localhost:3001',
    timeout: 10000,
  },
  app: {
    name: 'CodeMentor AI',
    version: '1.0.0',
    environment: 'test',
  },
  features: {
    analytics: false,
    debug: true,
    aiAssistance: true,
    collaboration: true,
    realTimeEditing: true,
  },
  editor: {
    monacoEditorCdn: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0',
    maxDocumentSize: 1048576, // 1MB
    autoSaveInterval: 30000, // 30 seconds
    validationDebounce: 1000, // 1 second
  },
  ai: {
    serviceUrl: 'http://localhost:3001/api/ai',
    reviewTimeout: 30000, // 30 seconds
    suggestionsEnabled: true,
  },
  collaboration: {
    timeout: 5000, // 5 seconds
    maxCollaborators: 10,
  },
  auth: {
    githubClientId: '',
    googleClientId: '',
  },
  external: {
    sentryDsn: '',
    googleAnalyticsId: '',
  },
} as const;

export const isDevelopment = false;
export const isProduction = false;

export const getEnvVar = (key: string, defaultValue?: string): string => {
  return defaultValue || '';
};

export const validateConfig = (): void => {
  // Mock implementation
};