// Core application types

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'instructor' | 'admin';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, any>;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Environment variables type
export interface AppConfig {
  apiBaseUrl: string;
  wsBaseUrl: string;
  apiTimeout: number;
  appName: string;
  appVersion: string;
  environment: string;
  enableAnalytics: boolean;
  enableDebug: boolean;
  githubClientId?: string;
  googleClientId?: string;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface TokenResponse {
  token: string;
  refreshToken: string;
}

// Lesson types
export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  estimatedTime: number; // in minutes
  prerequisites: string[];
  learningOutcomes: string[];
  trackId?: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Track {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  estimatedTime: number; // total time in minutes
  lessons: Lesson[];
  prerequisites: string[];
  learningOutcomes: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
}

// Code execution types
export type ProgrammingLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'cpp' | 'go';

export interface ExecutionRequest {
  code: string;
  language: ProgrammingLanguage;
  input?: string;
  timeout?: number;
}

export interface ExecutionResult {
  output: string;
  error?: string;
  executionTime: number;
  memoryUsage: number;
  status: 'success' | 'error' | 'timeout';
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: ProgrammingLanguage;
  starterCode: string;
  solution: string;
  testCases: TestCase[];
  hints: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface TestResult {
  testCases: TestCaseResult[];
  passed: number;
  total: number;
  allPassed: boolean;
  executionTime: number;
}

export interface TestCaseResult {
  testCase: TestCase;
  passed: boolean;
  actualOutput: string;
  error?: string;
}

// AI types
export interface CodeReview {
  id: string;
  code: string;
  language: ProgrammingLanguage;
  suggestions: CodeSuggestion[];
  overallScore: number;
  categories: {
    style: number;
    correctness: number;
    performance: number;
    security: number;
  };
  createdAt: string;
}

export interface CodeSuggestion {
  id: string;
  line: number;
  column?: number;
  type: 'style' | 'correctness' | 'performance' | 'security';
  severity: 'info' | 'warning' | 'error';
  message: string;
  suggestion: string;
  example?: string;
}

export interface Hint {
  id: string;
  content: string;
  type: 'concept' | 'implementation' | 'debugging';
  difficulty: number; // 1-5, where 1 is most helpful
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  metadata?: {
    code?: string;
    language?: ProgrammingLanguage;
    lessonId?: string;
    challengeId?: string;
  };
}

// Progress tracking types
export interface UserProgress {
  userId: string;
  lessonsCompleted: string[];
  tracksCompleted: string[];
  challengesCompleted: string[];
  totalLessonsCompleted: number;
  totalChallengesCompleted: number;
  currentStreak: number;
  longestStreak: number;
  totalTimeSpent: number; // in minutes
  skillLevels: Record<string, number>; // category -> level
  achievements: Achievement[];
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  unlockedAt: string;
}

export interface ProgressUpdate {
  lessonId?: string;
  challengeId?: string;
  timeSpent: number;
  completed: boolean;
  score?: number;
}

export interface ProgressStats {
  daily: ProgressDataPoint[];
  weekly: ProgressDataPoint[];
  monthly: ProgressDataPoint[];
  categories: CategoryProgress[];
}

export interface ProgressDataPoint {
  date: string;
  lessonsCompleted: number;
  challengesCompleted: number;
  timeSpent: number;
}

export interface CategoryProgress {
  category: string;
  completed: number;
  total: number;
  level: number;
  progress: number; // percentage
}

// Specification-based development types
export type SpecificationPhase = 'requirements' | 'design' | 'tasks' | 'implementation';

export interface SpecificationProject {
  id: string;
  name: string;
  description: string;
  currentPhase: SpecificationPhase;
  requirements?: RequirementDocument;
  design?: DesignDocument;
  tasks?: TaskDocument;
  createdAt: string;
  updatedAt: string;
}

export interface RequirementDocument {
  id: string;
  projectId: string;
  content: string;
  userStories: UserStory[];
  acceptanceCriteria: AcceptanceCriteria[];
  isComplete: boolean;
  validationResults: ValidationResult[];
  lastModified: string;
}

export interface UserStory {
  id: string;
  title: string;
  description: string;
  role: string;
  feature: string;
  benefit: string;
  acceptanceCriteria: AcceptanceCriteria[];
}

export interface AcceptanceCriteria {
  id: string;
  userStoryId: string;
  description: string;
  format: 'EARS' | 'GIVEN_WHEN_THEN';
  isValid: boolean;
}

export interface DesignDocument {
  id: string;
  projectId: string;
  content: string;
  architecture: string;
  components: ComponentSpecification[];
  dataModels: DataModel[];
  diagrams: Diagram[];
  isComplete: boolean;
  validationResults: ValidationResult[];
  lastModified: string;
}

export interface ComponentSpecification {
  id: string;
  name: string;
  description: string;
  interfaces: string[];
  dependencies: string[];
}

export interface DataModel {
  id: string;
  name: string;
  fields: DataField[];
  relationships: Relationship[];
}

export interface DataField {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface Relationship {
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  target: string;
  description?: string;
}

export interface Diagram {
  id: string;
  type: 'mermaid' | 'plantuml';
  content: string;
  title: string;
}

export interface TaskDocument {
  id: string;
  projectId: string;
  content: string;
  tasks: Task[];
  isComplete: boolean;
  validationResults: ValidationResult[];
  lastModified: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  dependencies: string[];
  estimatedEffort: number;
  status: 'not_started' | 'in_progress' | 'completed';
  assignee?: string;
}

export interface ValidationResult {
  type: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  column?: number;
  suggestion?: string;
}

export interface SpecificationTemplate {
  id: string;
  name: string;
  description: string;
  type: 'requirements' | 'design' | 'tasks';
  content: string;
  category: string;
  tags: string[];
}

export interface AIReviewResult {
  overallScore: number;
  suggestions: ValidationResult[];
  improvements: string[];
  completeness: number;
  clarity: number;
  feasibility: number;
}