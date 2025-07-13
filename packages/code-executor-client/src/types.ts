export interface ExecuteOptions {
  language: string;
  code: string;
  input?: string;
  timeoutSeconds?: number;
  memoryLimitMb?: number;
  cpuLimit?: number;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timeout: boolean;
  memoryExceeded: boolean;
  executionTimeMs: number;
  memoryUsedMb: number;
}

export interface HealthCheckResult {
  status: string;
  version: string;
}

export interface ClientConfig {
  host: string;
  port: number;
  // Additional config options can be added here
}

export interface RestClientConfig extends ClientConfig {
  protocol?: 'http' | 'https';
  basePath?: string;
}

export interface GrpcClientConfig extends ClientConfig {
  credentials?: any; // grpc credentials
  options?: any; // grpc channel options
}
