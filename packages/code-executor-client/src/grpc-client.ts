import { credentials, ChannelCredentials, Client } from '@grpc/grpc-js';
import { ExecuteOptions, ExecutionResult, HealthCheckResult, GrpcClientConfig } from './types';

// Import generated types (will be available after running generate script)
let ExecutorProto: any;
let CodeExecutorClient: any;

try {
  // Try to import generated types
  ExecutorProto = require('../generated/executor');
  CodeExecutorClient = ExecutorProto.CodeExecutorClient;
} catch (error) {
  console.warn('Generated proto types not found. Run "npm run generate" to generate them.');
  // Fallback interfaces for development
  interface ExecuteRequest {
    language: string;
    code: string;
    input: string;
    timeoutSeconds: number;
    memoryLimitMb: number;
    cpuLimit: number;
  }

  interface ExecuteResponse {
    stdout: string;
    stderr: string;
    exitCode: number;
    timeout: boolean;
    memoryExceeded: boolean;
    executionTimeMs: number;
    memoryUsedMb: number;
  }

  interface HealthRequest {}

  interface HealthResponse {
    status: string;
    version: string;
  }

  // Placeholder client
  CodeExecutorClient = class {
    constructor(address: string, credentials: any, options?: any) {
      throw new Error('Generated gRPC client not available. Run "npm run generate" first.');
    }
  };
}

/**
 * gRPC client for code execution service
 */
export class GrpcClient {
  private client: CodeExecutorClient;

  constructor(config: GrpcClientConfig) {
    const address = `${config.host}:${config.port}`;
    const creds = config.credentials || credentials.createInsecure();
    
    if (!CodeExecutorClient) {
      throw new Error('Generated gRPC client not available. Run "npm run generate" first.');
    }
    
    this.client = new CodeExecutorClient(
      address,
      creds,
      config.options
    );
  }

  /**
   * Execute code using gRPC
   */
  async execute(opts: ExecuteOptions): Promise<ExecutionResult> {
    return new Promise((resolve, reject) => {
      const request: ExecuteRequest = {
        language: opts.language,
        code: opts.code,
        input: opts.input || '',
        timeoutSeconds: opts.timeoutSeconds || 30,
        memoryLimitMb: opts.memoryLimitMb || 128,
        cpuLimit: opts.cpuLimit || 0.5,
      };

      this.client.execute(request, (error, response) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({
          stdout: response.stdout,
          stderr: response.stderr,
          exitCode: response.exitCode,
          timeout: response.timeout,
          memoryExceeded: response.memoryExceeded,
          executionTimeMs: response.executionTimeMs,
          memoryUsedMb: response.memoryUsedMb,
        });
      });
    });
  }

  /**
   * Health check using gRPC
   */
  async health(): Promise<HealthCheckResult> {
    return new Promise((resolve, reject) => {
      this.client.health({}, (error, response) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({
          status: response.status,
          version: response.version,
        });
      });
    });
  }

  /**
   * Close the gRPC client
   */
  close(): void {
    this.client.close();
  }
}

/**
 * Convenience function for gRPC code execution
 */
export async function execCodeGrpc(
  opts: ExecuteOptions,
  config: GrpcClientConfig = { host: 'localhost', port: 50051 }
): Promise<ExecutionResult> {
  const client = new GrpcClient(config);
  try {
    return await client.execute(opts);
  } finally {
    client.close();
  }
}
