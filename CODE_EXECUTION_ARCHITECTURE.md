# Code Execution Architecture

## Overview

The CodeMentor-AI platform includes a secure code execution service that allows learners to validate their implementations against specifications. This document describes the current architecture and integration points for the code execution system within the specification-based development learning platform.

## Architecture Context

### Specification-Based Development Focus

The code execution service is designed to support the specification-driven development methodology:

1. **Requirements Validation**: Execute code to verify it meets specified requirements
2. **Design Compliance**: Check if implementation follows the design specifications
3. **Task Completion**: Validate that implementation tasks are completed correctly
4. **Specification Traceability**: Maintain links between code and specifications

## Code Execution Service

### Location

- **Service Path**: `/code-runner/`
- **Port**: 8080 (containerized)
- **Technology**: Go-based microservice with Docker isolation

### Security Features

- Ephemeral Docker containers for each execution
- Resource limits (CPU, memory, time)
- Network isolation
- File system restrictions
- No persistent storage access

### Supported Languages

- JavaScript/TypeScript
- Python
- Go
- Java
- C++
- Additional languages can be added via Docker images

## Integration Points

### 1. Specification Validation Service

**Purpose**: Validate code implementation against specification documents

**Endpoints**:

- `POST /api/specifications/validate-implementation`
- `POST /api/specifications/test-requirements`

**Flow**:

```
Specification Document → Test Cases → Code Execution → Validation Results → Specification Compliance Report
```

### 2. Task Completion Verification

**Purpose**: Verify that implementation tasks are completed according to specifications

**Endpoints**:

- `POST /api/tasks/:taskId/verify`
- `POST /api/tasks/:taskId/test`

**Payload Structure**:

```typescript
interface TaskVerificationRequest {
  taskId: string;
  code: string;
  language: ProgrammingLanguage;
  specifications: {
    requirements: string[];
    acceptanceCriteria: AcceptanceCriteria[];
    testCases: TestCase[];
  };
}

interface TaskVerificationResponse {
  taskId: string;
  status: 'passed' | 'failed' | 'partial';
  requirementsCoverage: {
    total: number;
    covered: number;
    missing: string[];
  };
  testResults: TestResult[];
  suggestions: string[];
}
```

### 3. AI-Enhanced Code Review

**Purpose**: Combine code execution results with AI analysis for comprehensive feedback

**Integration with Claude Service**:

```typescript
interface CodeReviewWithExecutionRequest {
  code: string;
  language: string;
  specifications: SpecificationDocument;
  executionResults?: ExecutionResult;
}

interface EnhancedCodeReviewResponse {
  specificationCompliance: {
    score: number;
    details: ComplianceDetail[];
  };
  executionAnalysis: {
    performance: PerformanceMetrics;
    correctness: CorrectnessReport;
    edgeCases: EdgeCaseAnalysis[];
  };
  suggestions: AISuggestion[];
}
```

## Database Schema

### Current Models

```prisma
model Challenge {
  id                String              @id @default(cuid())
  title             String
  description       String
  specifications    Json                // Structured specification data
  testCases         Json                // Test cases derived from specifications
  validationRules   Json                // Rules for specification compliance
  // ... other fields
}

model Submission {
  id                String              @id @default(cuid())
  challengeId       String
  code              String              @db.Text
  language          ProgrammingLanguage
  status            SubmissionStatus

  // Execution results
  executionTime     Int?
  memoryUsage       Int?
  output            String?             @db.Text
  error             String?             @db.Text

  // Specification compliance
  specCompliance    Json                // Detailed compliance report
  requirementsMet   String[]            // List of met requirement IDs
  testResults       Json                // Detailed test results

  // ... other fields
}

model SpecificationProject {
  id                String              @id @default(cuid())
  name              String
  requirements      Json                // Requirements document
  design            Json                // Design document
  tasks             Json                // Task breakdown
  implementations   Implementation[]     // Linked implementations
  // ... other fields
}

model Implementation {
  id                String              @id @default(cuid())
  projectId         String
  taskId            String
  code              String              @db.Text
  language          ProgrammingLanguage
  validationStatus  ValidationStatus
  testResults       Json
  // ... other fields
}
```

## Environment Variables

### Code Execution Service Configuration

```bash
# Code Execution Service
CODE_RUNNER_PORT=8080
CODE_RUNNER_HOST=code-runner
CODE_RUNNER_TIMEOUT=30000
CODE_RUNNER_MAX_MEMORY=512M
CODE_RUNNER_MAX_CPU=100
CODE_RUNNER_TEMP_DIR=/tmp/executions

# Security Settings
ENABLE_NETWORK_ISOLATION=true
ENABLE_FILESYSTEM_ISOLATION=true
MAX_OUTPUT_SIZE=1048576
MAX_EXECUTION_TIME=30000

# Docker Configuration
DOCKER_SOCKET=/var/run/docker.sock
EXECUTION_IMAGE_PREFIX=codementor-executor-
CLEANUP_INTERVAL=300000
```

### API Service Configuration

```bash
# Code Execution Integration
CODE_EXECUTION_ENDPOINT=http://code-runner:8080
CODE_EXECUTION_API_KEY=${CODE_EXECUTION_API_KEY}
EXECUTION_RETRY_ATTEMPTS=3
EXECUTION_RETRY_DELAY=1000
```

## API Endpoints

### Specification Validation Endpoints

| Method | Endpoint                                    | Purpose                             |
| ------ | ------------------------------------------- | ----------------------------------- |
| POST   | `/api/specifications/:id/validate`          | Validate code against specification |
| POST   | `/api/specifications/:id/test-requirements` | Test specific requirements          |
| GET    | `/api/specifications/:id/compliance-report` | Get compliance report               |

### Task Verification Endpoints

| Method | Endpoint                             | Purpose                    |
| ------ | ------------------------------------ | -------------------------- |
| POST   | `/api/tasks/:id/verify`              | Verify task implementation |
| POST   | `/api/tasks/:id/run-tests`           | Run task-specific tests    |
| GET    | `/api/tasks/:id/verification-status` | Get verification status    |

### Execution History Endpoints

| Method | Endpoint                  | Purpose                        |
| ------ | ------------------------- | ------------------------------ |
| GET    | `/api/executions/history` | Get execution history          |
| GET    | `/api/executions/:id`     | Get specific execution details |
| GET    | `/api/executions/metrics` | Get execution metrics          |

## Integration with Specification Workflow

### 1. Requirements Phase

- No direct code execution needed
- Focus on specification document creation

### 2. Design Phase

- No direct code execution needed
- Architecture and component design

### 3. Tasks Phase

- Test case generation from specifications
- Validation rule creation

### 4. Implementation Phase

- **Primary code execution integration point**
- Continuous validation against specifications
- Real-time feedback on compliance

### 5. Review Phase

- Comprehensive execution of all test cases
- Full specification compliance report
- Performance and quality metrics

## Security Considerations

### Sandboxing

- Each execution runs in an isolated Docker container
- Containers are destroyed after execution
- No persistent state between executions

### Resource Limits

- CPU usage capped per execution
- Memory limits enforced
- Execution time limits
- Output size restrictions

### Network Security

- No outbound network access from execution containers
- Isolated network namespace
- No access to host network

## Monitoring and Metrics

### Execution Metrics

- Total executions per time period
- Language distribution
- Success/failure rates
- Resource usage patterns

### Specification Compliance Metrics

- Requirements coverage percentage
- Common compliance failures
- Task completion rates
- Implementation quality trends

## Future Enhancements

### Planned Features

1. **Parallel Test Execution**: Run multiple test cases concurrently
2. **Incremental Testing**: Only test changed code sections
3. **Performance Profiling**: Detailed performance analysis
4. **Visual Test Results**: Graphical representation of test coverage
5. **Specification-Driven Test Generation**: Auto-generate tests from specifications

### Integration Improvements

1. **Real-time Execution**: WebSocket-based live execution feedback
2. **Collaborative Debugging**: Multi-user debugging sessions
3. **AI-Powered Test Suggestions**: Claude-generated test cases
4. **Specification Coverage Analysis**: Visual coverage mapping

## Best Practices

### For Developers

1. Always validate code against specifications before submission
2. Use the test-driven approach with specification-derived tests
3. Monitor execution metrics for performance optimization
4. Leverage AI feedback for specification compliance

### For Platform Maintainers

1. Regular security audits of execution environment
2. Monitor resource usage patterns
3. Keep execution images updated
4. Maintain execution logs for debugging

## Conclusion

The code execution architecture is designed to support the specification-based development methodology by providing secure, isolated environments for validating implementations against specifications. The system ensures that learners can practice the complete specification-to-implementation workflow with real-time feedback and comprehensive validation.
