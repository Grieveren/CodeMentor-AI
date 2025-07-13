# Code Execution Integration Audit

## Overview
This document maps all points where code execution is required in the Express API, documenting current call flows, payload/response shapes, and environment variables that will need to reference the Go executor.

## Current Architecture Issues

### Database Schema Mismatch
The current implementation references database tables that don't exist:
- `ExecutionService` references `prisma.exercise` (line 55) - should be `challenge`
- `ExecutionService` references `prisma.codeExecution` (line 94, 150) - doesn't exist in schema

### Missing Tables
The `codeExecution` table referenced in the service doesn't exist in the current Prisma schema. It should be added or the service should be updated to use the existing `Submission` model.

## Code Execution Points

### 1. ExecutionService (`/server/src/features/execution/service.ts`)

**Current Methods:**
- `executeCode()` - Direct code execution
- `testCode()` - Run code against test cases
- `validateSolution()` - Validate solutions against challenge requirements
- `getExecutionHistory()` - Retrieve execution history

**Current Implementation:**
- Mock JavaScript execution only
- No actual code execution (line 15-19)
- Placeholder warnings about production security

**Required Integration Points:**
1. **Direct Code Execution** (line 7-20)
2. **Test Case Execution** (line 22-51)
3. **Challenge Validation** (line 53-91)

### 2. AI Hint Generation (`/server/src/features/ai/service.ts`)

**Current Methods:**
- `generateHint()` - Generate contextual hints (line 14-42)
- `reviewCode()` - AI-powered code review (line 61-103)

**Integration Points:**
1. **AI Hint Generation** with code execution context
2. **Code Review** with execution results

### 3. AI Controller (`/server/src/features/ai/controller.ts`)

**Current Methods:**
- `generateHint()` - HTTP endpoint for hint generation (line 16-29)
- `reviewCode()` - HTTP endpoint for code review (line 46-59)
- `analyzeCode()` - Claude-powered code analysis (line 87-99)
- `generateHints()` - Enhanced hint generation (line 101-113)

### 4. Claude Service (`/server/src/services/claudeService.ts`)

**Current Methods:**
- `analyzeCode()` - Code analysis and feedback (line 239-289)
- `generateHints()` - Contextual hint generation (line 294-342)

**Integration Points:**
- Code analysis requires execution results for better feedback
- Hint generation could benefit from execution error context

## API Endpoints

### Execution Endpoints (`/api/execution`)
| Method | Endpoint | Handler | Purpose |
|--------|----------|---------|---------|
| POST | `/execute` | `executeCode` | Direct code execution |
| POST | `/test` | `testCode` | Run code against test cases |
| POST | `/validate` | `validateSolution` | Validate challenge solutions |
| GET | `/history` | `getExecutionHistory` | Get execution history |

### AI Endpoints (`/api/ai`)
| Method | Endpoint | Handler | Purpose |
|--------|----------|---------|---------|
| POST | `/hint` | `generateHint` | Generate coding hints |
| POST | `/review` | `reviewCode` | AI code review |
| POST | `/analyze` | `analyzeCode` | Code analysis |
| POST | `/hints` | `generateHints` | Enhanced hints |

## Current Payload/Response Shapes

### ExecutionService Payloads

#### `executeCode` Request
```typescript
{
  code: string;
  language: string;
  input: string;
}
```

#### `executeCode` Response
```typescript
{
  output: string;
  error: string | null;
  executionTime: number;
  success: boolean;
}
```

#### `testCode` Request
```typescript
{
  code: string;
  language: string;
  testCases: Array<{
    input: string;
    expected: string;
    description?: string;
  }>;
}
```

#### `testCode` Response
```typescript
{
  totalTests: number;
  passedTests: number;
  results: Array<{
    input: string;
    expected: string;
    actual: string | null;
    passed: boolean;
    executionTime: number;
    error?: string;
  }>;
}
```

#### `validateSolution` Request
```typescript
{
  code: string;
  exerciseId: string;
  language: string;
}
```

#### `validateSolution` Response
```typescript
{
  isValid: boolean;
  score: number;
  testResults: TestResults;
  feedback: string;
}
```

### AI Service Payloads

#### `generateHint` Request
```typescript
{
  exerciseId: string;
  userCode: string;
  errorMessage?: string;
}
```

#### `generateHint` Response
```typescript
{
  hint: string;
  confidence: number;
  suggestedApproach: string;
  nextSteps: string[];
}
```

#### `reviewCode` Request
```typescript
{
  code: string;
  language: string;
}
```

#### `reviewCode` Response
```typescript
{
  overall_score: number;
  suggestions: Array<{
    line: number;
    type: string;
    message: string;
    severity: string;
  }>;
  strengths: string[];
  improvements: string[];
}
```

## Environment Variables

### Current Environment Variables (from .env.example)
```bash
# External Services
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/codementor_ai

# Server
NODE_ENV=development
PORT=3001
HOST=localhost
```

### Required Go Executor Environment Variables
```bash
# Go Code Executor Configuration
CODE_EXECUTOR_HOST=localhost
CODE_EXECUTOR_PORT=8080
CODE_EXECUTOR_TIMEOUT=30000
CODE_EXECUTOR_MAX_MEMORY=256
CODE_EXECUTOR_MAX_CPU=80
CODE_EXECUTOR_DOCKER_IMAGE=code-executor:latest
CODE_EXECUTOR_ENABLE_NETWORKING=false
CODE_EXECUTOR_ENABLE_FILESYSTEM=false
```

## Call Flow Analysis

### 1. Direct Code Execution Flow
```
Client Request → ExecutionController.executeCode() → ExecutionService.executeCode() → [GO EXECUTOR] → Response
```

**Current Implementation:**
- Controller validates input (line 13-27 in controller.ts)
- Service logs execution attempt (line 11-12 in service.ts)
- Mock execution for JavaScript only (line 15-19 in service.ts)

**Required Integration:**
- Replace mock execution with HTTP call to Go executor
- Add support for multiple languages
- Handle execution timeouts and errors

### 2. Test Case Execution Flow
```
Client Request → ExecutionController.testCode() → ExecutionService.testCode() → ExecutionService.executeCode() → [GO EXECUTOR] → Response
```

**Current Implementation:**
- Iterates through test cases (line 25-44 in service.ts)
- Calls executeCode for each test case
- Aggregates results

**Required Integration:**
- Batch test case execution to Go executor
- Optimize for multiple test cases
- Handle partial failures

### 3. Challenge Validation Flow
```
Client Request → ExecutionController.validateSolution() → ExecutionService.validateSolution() → Database → ExecutionService.testCode() → [GO EXECUTOR] → Database → Response
```

**Current Implementation:**
- Fetches challenge from database (line 54-65 in service.ts)
- Runs test cases against user code
- Saves submission to database (line 72-83 in service.ts)

**Required Integration:**
- Update database queries to use `challenge` instead of `exercise`
- Add proper error handling for Go executor failures
- Implement retry logic for transient failures

### 4. AI Hint Generation Flow
```
Client Request → AIController.generateHint() → AIService.generateHint() → ClaudeService.generateHints() → [CLAUDE API] → Response
```

**Current Implementation:**
- Takes exercise ID and user code as input
- Calls Claude API for hint generation
- Includes error context if provided

**Required Integration:**
- Add execution results to hint generation context
- Include performance metrics in AI analysis
- Provide execution error details to improve hints

## Database Models

### Current Models Used
```typescript
// Existing in schema
model Challenge {
  id: string;
  title: string;
  description: string;
  instructions: string;
  startingCode: string;
  solution: string;
  testCases: Json; // Array of test cases
  // ... other fields
}

model Submission {
  id: string;
  code: string;
  language: ProgrammingLanguage;
  status: SubmissionStatus;
  output: string?;
  error: string?;
  executionTime: int?;
  testResults: Json?;
  score: float?;
  // ... other fields
}
```

### Missing Models Referenced in Code
```typescript
// Referenced but doesn't exist
model Exercise {
  // This model is referenced in ExecutionService but doesn't exist
  // Should be replaced with Challenge model
}

model CodeExecution {
  // This model is referenced for logging but doesn't exist
  // Could be replaced with Submission model or created separately
}
```

## Required Changes for Go Executor Integration

### 1. Database Schema Updates
- Remove references to non-existent `exercise` table
- Update `ExecutionService` to use `challenge` model
- Create `CodeExecution` model or update `Submission` model for execution logging

### 2. ExecutionService Updates
- Replace mock execution with HTTP client for Go executor
- Add support for multiple programming languages
- Implement proper error handling and timeouts
- Add execution metrics tracking

### 3. Environment Configuration
- Add Go executor configuration variables
- Add connection pooling and retry logic configuration
- Add security and sandboxing configuration

### 4. API Contract Updates
- Ensure payload shapes match Go executor requirements
- Add additional metadata fields for execution context
- Update response shapes to include execution metrics

### 5. AI Integration Updates
- Pass execution results to AI services for better context
- Include performance metrics in code analysis
- Add execution error details to hint generation

## Recommendations

1. **Fix Database Schema Issues**: Update all references to use correct models
2. **Add Missing Environment Variables**: Include all Go executor configuration
3. **Implement HTTP Client**: Replace mock execution with actual Go executor calls
4. **Add Comprehensive Error Handling**: Handle network failures, timeouts, and execution errors
5. **Optimize Test Case Execution**: Batch multiple test cases for better performance
6. **Enhance AI Context**: Include execution results in AI service calls
7. **Add Monitoring**: Implement logging and metrics for code execution
8. **Security Hardening**: Add rate limiting and resource constraints

## Next Steps

1. Update database schema to match current code references
2. Add environment variables for Go executor configuration
3. Implement HTTP client for Go executor communication
4. Update payload shapes to match Go executor requirements
5. Add comprehensive error handling and retry logic
6. Implement execution metrics and monitoring
7. Update AI services to use execution context
8. Add integration tests for end-to-end execution flow
