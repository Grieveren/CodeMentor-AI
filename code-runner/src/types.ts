export interface RunRequest {
  challengeId: string;
  code: string;
  language: string;
  stdin?: string;
}

export interface TestCase {
  input: string;
  expected: string;
  description?: string;
}

export interface TestResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  memoryUsedMb: number;
  timeout: boolean;
  memoryExceeded: boolean;
  error?: string;
}

export interface SubmissionStatus {
  id: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'TIMEOUT';
  totalTests: number;
  passedTests: number;
  failedTests: number;
  score: number;
  executionTimeMs: number;
  memoryUsedMb: number;
  results: TestResult[];
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExecutionProgressEvent {
  submissionId: string;
  challengeId: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'TIMEOUT';
  progress: {
    totalTests: number;
    completedTests: number;
    passedTests: number;
    failedTests: number;
  };
  currentTest?: {
    index: number;
    description?: string;
    input: string;
    expected: string;
  };
  error?: string;
}

export interface CodeExecutorConfig {
  host: string;
  port: number;
  protocol: 'http' | 'https';
  maxConcurrent: number;
  timeoutSeconds: number;
  memoryLimitMb: number;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
}

export interface DatabaseConfig {
  url: string;
}

export interface AppConfig {
  port: number;
  host: string;
  corsOrigin: string;
  apiKey: string;
  nodeEnv: string;
  logLevel: string;
}

export interface Config {
  app: AppConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
  codeExecutor: CodeExecutorConfig;
}
