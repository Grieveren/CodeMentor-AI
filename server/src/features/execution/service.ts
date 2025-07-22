import {
  PrismaClient,
  ProgrammingLanguage,
} from '../../generated/prisma/index.js';
import { CustomError } from '../../middleware/errorHandler.js';
import { createLogger } from '../../lib/logger.js';

const prisma = new PrismaClient();
const logger = createLogger({ prefix: 'ExecutionService' });

export class ExecutionService {
  async executeCode(
    code: string,
    language: string,
    _input: string,
    userId: string
  ) {
    // Placeholder for code execution
    // In a real implementation, this would use Docker containers or sandboxed environments

    // Log the execution attempt
    await this.logExecution(userId, code, language, _input);

    // Simulate code execution
    if (language === 'javascript') {
      return this.executeJavaScript(code, _input);
    } else {
      throw new CustomError(`Language ${language} not supported yet`, 400);
    }
  }

  async testCode(
    code: string,
    language: string,
    testCases: any[],
    userId: string
  ) {
    const results = [];

    for (const testCase of testCases) {
      try {
        const result = await this.executeCode(
          code,
          language,
          testCase.input,
          userId
        );
        results.push({
          input: testCase.input,
          expected: testCase.expected,
          actual: result.output,
          passed: result.output === testCase.expected,
          executionTime: result.executionTime,
        });
      } catch (error: any) {
        results.push({
          input: testCase.input,
          expected: testCase.expected,
          actual: null,
          passed: false,
          error: error.message,
        });
      }
    }

    return {
      totalTests: testCases.length,
      passedTests: results.filter(r => r.passed).length,
      results,
    };
  }

  async validateSolution(
    code: string,
    exerciseId: string,
    language: string,
    userId: string
  ) {
    // Get exercise test cases from database
    const challenge = await prisma.challenge.findUnique({
      where: { id: exerciseId },
      select: {
        testCases: true,
        title: true,
      },
    });

    if (!challenge) {
      throw new CustomError('Challenge not found', 404);
    }

    // Run tests
    const testResults = await this.testCode(
      code,
      language,
      challenge.testCases as any[],
      userId
    );

    const isValid = testResults.passedTests === testResults.totalTests;

    // Save submission
    await prisma.submission.create({
      data: {
        userId,
        challengeId: exerciseId,
        code,
        language: language as ProgrammingLanguage,
        status: isValid ? 'COMPLETED' : 'FAILED',
        score: isValid
          ? 100
          : (testResults.passedTests / testResults.totalTests) * 100,
        testResults: testResults,
      },
    });

    return {
      isValid,
      score: isValid
        ? 100
        : (testResults.passedTests / testResults.totalTests) * 100,
      testResults,
      feedback: isValid
        ? 'Great job! All tests passed.'
        : 'Some tests failed. Review the failing cases.',
    };
  }

  async getExecutionHistory(
    userId: string,
    options: { limit: number; offset: number }
  ) {
    return await prisma.submission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: options.limit,
      skip: options.offset,
      select: {
        id: true,
        language: true,
        createdAt: true,
        status: true,
        executionTime: true,
        code: true,
        output: true,
        error: true,
      },
    });
  }

  private async executeJavaScript(code: string, _input: string) {
    const startTime = Date.now();

    try {
      // This is a very basic simulation - in production, use a secure sandbox
      // WARNING: This is not secure and should not be used in production
      let output = '';
      const error = null;

      // Simple mock execution
      if (code.includes('console.log')) {
        output = 'Mock output from console.log';
      } else if (code.includes('return')) {
        output = 'Function returned a value';
      } else {
        output = 'Code executed successfully';
      }

      const executionTime = Date.now() - startTime;

      return {
        output,
        error,
        executionTime,
        success: true,
      };
    } catch (err: any) {
      return {
        output: '',
        error: err.message,
        executionTime: Date.now() - startTime,
        success: false,
      };
    }
  }

  private async logExecution(
    userId: string,
    code: string,
    language: string,
    _input: string
  ) {
    try {
      // This function will need to be rewritten to match the Submission model
      // For now, just log without database insertion
      logger.debug('Logging execution:', {
        userId,
        code,
        language,
        input: _input,
      });
    } catch (error) {
      // Log error but don't fail the execution
      logger.error('Failed to log execution:', error);
    }
  }
}
