// import { RestClient } from '@codementor-ai/code-executor-client';
// Mock RestClient to avoid Docker spawn logic
class RestClient {
  constructor(options?: any) {}
  async execute(options: any) {
    // Return mocked successful execution result
    return {
      stdout: 'mocked output',
      stderr: '',
      exitCode: 0,
      executionTimeMs: 100,
      memoryUsedMb: 10,
      timeout: false,
      memoryExceeded: false
    };
  }
}
import pLimit from 'p-limit';
import { config } from '../config.js';
import { TestCase, TestResult, SubmissionStatus, ExecutionProgressEvent } from '../types.js';
import { databaseService } from './database.js';
import { redisService } from './redis.js';

export class ExecutionService {
  private codeExecutorClient: RestClient;
  private concurrencyLimit: ReturnType<typeof pLimit>;

  constructor() {
    this.codeExecutorClient = new RestClient({
      host: config.codeExecutor.host,
      port: config.codeExecutor.port,
      protocol: config.codeExecutor.protocol,
    });
    
    this.concurrencyLimit = pLimit(config.codeExecutor.maxConcurrent);
  }

  async executeCode(
    challengeId: string,
    code: string,
    language: string,
    stdin: string = '',
    userId: string = 'anonymous'
  ): Promise<SubmissionStatus> {
    console.log('Starting code execution for challenge:', challengeId);
    
    // Create initial submission record
    const submission = await databaseService.createSubmission({
      challengeId,
      userId,
      code,
      language,
      status: 'PENDING',
    });

    const submissionId = submission.id;

    try {
      // Check if execution is already in progress
      const lockAcquired = await redisService.setExecutionLock(submissionId);
      if (!lockAcquired) {
        throw new Error('Execution already in progress for this submission');
      }

      // Update status to RUNNING
      await databaseService.updateSubmission(submissionId, { status: 'RUNNING' });

      // Publish initial progress event
      await this.publishProgressEvent(submissionId, challengeId, 'RUNNING', {
        totalTests: 0,
        completedTests: 0,
        passedTests: 0,
        failedTests: 0,
      });

      // Fetch test cases
      const testCases = await databaseService.getChallengeTestCases(challengeId);
      
      if (testCases.length === 0) {
        throw new Error('No test cases found for this challenge');
      }

      console.log(`Found ${testCases.length} test cases for challenge ${challengeId}`);

      // Execute code against all test cases concurrently
      const results = await this.executeTestCases(
        submissionId,
        challengeId,
        code,
        language,
        testCases,
        stdin
      );

      // Calculate final results
      const passedTests = results.filter(r => r.passed).length;
      const failedTests = results.length - passedTests;
      const score = Math.round((passedTests / results.length) * 100);
      const totalExecutionTime = results.reduce((sum, r) => sum + r.executionTimeMs, 0);
      const maxMemoryUsed = Math.max(...results.map(r => r.memoryUsedMb));

      const status: SubmissionStatus['status'] = 
        failedTests === 0 ? 'COMPLETED' : 
        passedTests === 0 ? 'FAILED' : 'COMPLETED';

      // Update submission with final results
      await databaseService.updateSubmission(submissionId, {
        status,
        testResults: results,
        score,
        executionTime: totalExecutionTime,
        memoryUsage: Math.round(maxMemoryUsed * 1024 * 1024), // Convert MB to bytes
      });

      // Create final submission status
      const submissionStatus: SubmissionStatus = {
        id: submissionId,
        status,
        totalTests: results.length,
        passedTests,
        failedTests,
        score,
        executionTimeMs: totalExecutionTime,
        memoryUsedMb: maxMemoryUsed,
        results,
        createdAt: submission.createdAt,
        updatedAt: new Date(),
      };

      // Publish final progress event
      await this.publishProgressEvent(submissionId, challengeId, status, {
        totalTests: results.length,
        completedTests: results.length,
        passedTests,
        failedTests,
      });

      // Cache result
      await redisService.cacheSubmissionResult(submissionId, submissionStatus);

      // Publish completion event
      await redisService.publishExecutionComplete(submissionId, submissionStatus);

      console.log(`Code execution completed for submission ${submissionId}:`, {
        status,
        passedTests,
        failedTests,
        score,
      });

      return submissionStatus;

    } catch (error) {
      console.error('Error executing code:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Update submission with error
      await databaseService.updateSubmission(submissionId, {
        status: 'FAILED',
        error: errorMessage,
      });

      // Publish error event
      await this.publishProgressEvent(submissionId, challengeId, 'FAILED', {
        totalTests: 0,
        completedTests: 0,
        passedTests: 0,
        failedTests: 0,
      }, errorMessage);

      await redisService.publishExecutionError(submissionId, errorMessage);

      throw error;
    } finally {
      // Release execution lock
      await redisService.releaseExecutionLock(submissionId);
    }
  }

  private async executeTestCases(
    submissionId: string,
    challengeId: string,
    code: string,
    language: string,
    testCases: TestCase[],
    stdin: string
  ): Promise<TestResult[]> {
    const results: TestResult[] = [];
    let completedTests = 0;
    let passedTests = 0;

    // Create promises for concurrent execution
    const testPromises = testCases.map((testCase, index) => 
      this.concurrencyLimit(async () => {
        try {
          console.log(`Executing test case ${index + 1}/${testCases.length} for submission ${submissionId}`);
          
          // Publish progress for current test
          await this.publishProgressEvent(submissionId, challengeId, 'RUNNING', {
            totalTests: testCases.length,
            completedTests,
            passedTests,
            failedTests: completedTests - passedTests,
          }, undefined, testCase.description !== undefined ? {
            index,
            description: testCase.description,
            input: testCase.input,
            expected: testCase.expected,
          } : {
            index,
            input: testCase.input,
            expected: testCase.expected,
          });

          // Execute code with test case input
          const executionResult = await this.codeExecutorClient.execute({
            language,
            code,
            input: testCase.input || stdin,
            timeoutSeconds: config.codeExecutor.timeoutSeconds,
            memoryLimitMb: config.codeExecutor.memoryLimitMb,
          });

          // Create test result
          const testResult: TestResult = {
            input: testCase.input,
            expected: testCase.expected,
            actual: executionResult.stdout.trim(),
            passed: executionResult.stdout.trim() === testCase.expected.trim(),
            stdout: executionResult.stdout,
            stderr: executionResult.stderr,
            exitCode: executionResult.exitCode,
            executionTimeMs: executionResult.executionTimeMs,
            memoryUsedMb: executionResult.memoryUsedMb,
            timeout: executionResult.timeout,
            memoryExceeded: executionResult.memoryExceeded,
          };

          // Handle execution errors
          if (executionResult.exitCode !== 0 && !testResult.passed) {
            testResult.error = executionResult.stderr || 'Execution failed';
          }

          completedTests++;
          if (testResult.passed) {
            passedTests++;
          }

          console.log(`Test case ${index + 1} completed:`, {
            passed: testResult.passed,
            executionTime: testResult.executionTimeMs,
            memoryUsed: testResult.memoryUsedMb,
          });

          return testResult;

        } catch (error) {
          console.error(`Error executing test case ${index + 1}:`, error);
          
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          
          completedTests++;
          
          return {
            input: testCase.input,
            expected: testCase.expected,
            actual: '',
            passed: false,
            stdout: '',
            stderr: errorMessage,
            exitCode: -1,
            executionTimeMs: 0,
            memoryUsedMb: 0,
            timeout: false,
            memoryExceeded: false,
            error: errorMessage,
          } as TestResult;
        }
      })
    );

    // Wait for all test cases to complete
    const testResults = await Promise.all(testPromises);
    
    return testResults;
  }

  private async publishProgressEvent(
    submissionId: string,
    challengeId: string,
    status: ExecutionProgressEvent['status'],
    progress: ExecutionProgressEvent['progress'],
    error?: string,
    currentTest?: ExecutionProgressEvent['currentTest']
  ): Promise<void> {
    const event: ExecutionProgressEvent = {
      submissionId,
      challengeId,
      status,
      progress,
      ...(currentTest !== undefined && { currentTest }),
      ...(error !== undefined && { error }),
    };

    await redisService.publishExecutionUpdate(event);
  }
}

export const executionService = new ExecutionService();
