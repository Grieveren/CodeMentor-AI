# Code Executor Client

A TypeScript client library for the Code Executor service, providing both REST and gRPC interfaces.

## Installation

```bash
npm install @codementor-ai/code-executor-client
```

## Usage

### REST Client

```typescript
import { execCodeRest } from '@codementor-ai/code-executor-client';

const result = await execCodeRest({
  language: 'python',
  code: 'print("Hello, World!")',
  input: '',
  timeoutSeconds: 30,
  memoryLimitMb: 128,
  cpuLimit: 0.5
});

console.log(result.stdout); // "Hello, World!"
```

### gRPC Client

```typescript
import { execCodeGrpc } from '@codementor-ai/code-executor-client';

const result = await execCodeGrpc({
  language: 'python',
  code: 'print("Hello, World!")',
  input: '',
  timeoutSeconds: 30,
  memoryLimitMb: 128,
  cpuLimit: 0.5
});

console.log(result.stdout); // "Hello, World!"
```

### Using Client Classes

```typescript
import { RestClient, GrpcClient } from '@codementor-ai/code-executor-client';

// REST Client
const restClient = new RestClient({
  host: 'localhost',
  port: 8080,
  protocol: 'http'
});

const result = await restClient.execute({
  language: 'python',
  code: 'print("Hello, World!")'
});

// gRPC Client
const grpcClient = new GrpcClient({
  host: 'localhost',
  port: 50051
});

const result = await grpcClient.execute({
  language: 'python',
  code: 'print("Hello, World!")'
});

// Don't forget to close the gRPC client
grpcClient.close();
```

## Development

### Generate Proto Types

Before building the package, you need to generate TypeScript types from the proto files:

```bash
npm run generate
```

### Build

```bash
npm run build
```

### Clean

```bash
npm run clean
```

## API Reference

### ExecuteOptions

```typescript
interface ExecuteOptions {
  language: string;          // Programming language (python, javascript, go, etc.)
  code: string;              // Code to execute
  input?: string;            // Optional stdin input
  timeoutSeconds?: number;   // Execution timeout (default: 30s)
  memoryLimitMb?: number;    // Memory limit in MB (default: 128MB)
  cpuLimit?: number;         // CPU limit as fraction (default: 0.5)
}
```

### ExecutionResult

```typescript
interface ExecutionResult {
  stdout: string;            // Standard output
  stderr: string;            // Standard error
  exitCode: number;          // Exit code
  timeout: boolean;          // Whether execution timed out
  memoryExceeded: boolean;   // Whether memory limit was exceeded
  executionTimeMs: number;   // Execution time in milliseconds
  memoryUsedMb: number;      // Memory used in MB
}
```

### Client Configuration

```typescript
interface RestClientConfig {
  host: string;
  port: number;
  protocol?: 'http' | 'https';
  basePath?: string;
}

interface GrpcClientConfig {
  host: string;
  port: number;
  credentials?: any;         // grpc credentials
  options?: any;             // grpc channel options
}
```
