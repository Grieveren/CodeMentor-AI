import { ExecuteOptions, ExecutionResult, HealthCheckResult, RestClientConfig } from './types';

/**
 * REST client for code execution service
 */
export class RestClient {
  private baseUrl: string;

  constructor(config: RestClientConfig) {
    const protocol = config.protocol || 'http';
    const basePath = config.basePath || '';
    this.baseUrl = `${protocol}://${config.host}:${config.port}${basePath}`;
  }

  /**
   * Execute code using REST API
   */
  async execute(opts: ExecuteOptions): Promise<ExecutionResult> {
    const response = await fetch(`${this.baseUrl}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: opts.language,
        code: opts.code,
        input: opts.input || '',
        timeout_seconds: opts.timeoutSeconds || 30,
        memory_limit_mb: opts.memoryLimitMb || 128,
        cpu_limit: opts.cpuLimit || 0.5,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    return {
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      exitCode: result.exit_code || 0,
      timeout: result.timeout || false,
      memoryExceeded: result.memory_exceeded || false,
      executionTimeMs: result.execution_time_ms || 0,
      memoryUsedMb: result.memory_used_mb || 0,
    };
  }

  /**
   * Health check using REST API
   */
  async health(): Promise<HealthCheckResult> {
    const response = await fetch(`${this.baseUrl}/health`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    return {
      status: result.status || 'unknown',
      version: result.version || 'unknown',
    };
  }
}

/**
 * Convenience function for REST code execution
 */
export async function execCodeRest(
  opts: ExecuteOptions,
  config: RestClientConfig = { host: 'localhost', port: 8080 }
): Promise<ExecutionResult> {
  const client = new RestClient(config);
  return client.execute(opts);
}
