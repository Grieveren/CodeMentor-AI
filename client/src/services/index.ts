// Import service instances for unified API object
import { authService } from './authService';
import { lessonsService } from './lessonsService';
import { aiService } from './aiService';
import { executionService } from './executionService';
import { progressService } from './progressService';
import { templatesService } from './templatesService';
import { validationService } from './validationService';

// Export API client
export { apiClient, default as ApiClient } from './apiClient';

// Export service instances
export { authService, AuthService } from './authService';
export { lessonsService, LessonsService } from './lessonsService';
export { aiService, AIService } from './aiService';
export { executionService, ExecutionService } from './executionService';
export { progressService, ProgressService } from './progressService';
export { templatesService, TemplatesService } from './templatesService';
export { validationService, ValidationService } from './validationService';

// Export service types
export type {
  LessonFilters,
  LessonQueryParams,
  PaginatedResponse,
} from './lessonsService';

export type {
  CodeReviewRequest,
  HintRequest,
  ChatRequest,
  ChatResponse,
  ExplanationRequest,
  CodeExplanationRequest,
} from './aiService';

export type {
  CodeExecutionOptions,
  ChallengeSubmission,
  ExecutionStatus,
} from './executionService';

export type {
  ProgressFilters,
  LeaderboardEntry,
  StreakInfo,
} from './progressService';

// Create a unified API service object for convenience
export const api = {
  auth: authService,
  lessons: lessonsService,
  ai: aiService,
  execution: executionService,
  progress: progressService,
  templates: templatesService,
  validation: validationService,
} as const;

// Default export
export default api;