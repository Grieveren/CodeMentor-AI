import { apiClient } from './apiClient';
import type {
  ExecutionRequest,
  ExecutionResult,
  TestResult,
  ProgrammingLanguage,
} from '@/types';

export interface CodeExecutionOptions {
  timeout?: number; // in seconds
  memoryLimit?: number; // in MB
  includeMetrics?: boolean;
}

export interface ChallengeSubmission {
  challengeId: string;
  code: string;
  language: ProgrammingLanguage;
}

export interface ExecutionStatus {
  id: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'timeout';
  progress?: number;
  message?: string;
}

export class ExecutionService {
  /**
   * Execute code and return results
   */
  async executeCode(
    request: ExecutionRequest,
    options?: CodeExecutionOptions
  ): Promise<ExecutionResult> {
    const payload = {
      ...request,
      ...options,
    };

    const response = await apiClient.post<ExecutionResult>('/api/execution/run', payload);
    return response.data;
  }

  /**
   * Execute code asynchronously and return execution ID for status polling
   */
  async executeCodeAsync(
    request: ExecutionRequest,
    options?: CodeExecutionOptions
  ): Promise<{ executionId: string }> {
    const payload = {
      ...request,
      ...options,
      async: true,
    };

    const response = await apiClient.post<{ executionId: string }>('/api/execution/run', payload);
    return response.data;
  }

  /**
   * Get execution status for async execution
   */
  async getExecutionStatus(executionId: string): Promise<ExecutionStatus> {
    const response = await apiClient.get<ExecutionStatus>(`/api/execution/status/${executionId}`);
    return response.data;
  }

  /**
   * Get execution result for async execution
   */
  async getExecutionResult(executionId: string): Promise<ExecutionResult> {
    const response = await apiClient.get<ExecutionResult>(`/api/execution/result/${executionId}`);
    return response.data;
  }

  /**
   * Cancel running execution
   */
  async cancelExecution(executionId: string): Promise<void> {
    await apiClient.post(`/api/execution/cancel/${executionId}`);
  }

  /**
   * Submit solution for a challenge
   */
  async submitChallenge(submission: ChallengeSubmission): Promise<TestResult> {
    const response = await apiClient.post<TestResult>('/api/execution/challenge', submission);
    return response.data;
  }

  /**
   * Test code against challenge test cases
   */
  async testChallenge(
    challengeId: string,
    code: string,
    language: ProgrammingLanguage
  ): Promise<TestResult> {
    const response = await apiClient.post<TestResult>('/api/execution/test', {
      challengeId,
      code,
      language,
    });
    return response.data;
  }

  /**
   * Run specific test cases
   */
  async runTestCases(
    code: string,
    language: ProgrammingLanguage,
    testCases: Array<{ input: string; expectedOutput: string }>
  ): Promise<TestResult> {
    const response = await apiClient.post<TestResult>('/api/execution/test-cases', {
      code,
      language,
      testCases,
    });
    return response.data;
  }

  /**
   * Get supported programming languages
   */
  async getSupportedLanguages(): Promise<{
    languages: Array<{
      id: ProgrammingLanguage;
      name: string;
      version: string;
      extensions: string[];
      defaultCode: string;
    }>;
  }> {
    const response = await apiClient.get<{
      languages: Array<{
        id: ProgrammingLanguage;
        name: string;
        version: string;
        extensions: string[];
        defaultCode: string;
      }>;
    }>('/api/execution/languages');
    return response.data;
  }

  /**
   * Get execution limits for current user
   */
  async getExecutionLimits(): Promise<{
    maxExecutionsPerHour: number;
    maxExecutionTime: number;
    maxMemoryUsage: number;
    currentUsage: {
      executionsThisHour: number;
      resetTime: string;
    };
  }> {
    const response = await apiClient.get<{
      maxExecutionsPerHour: number;
      maxExecutionTime: number;
      maxMemoryUsage: number;
      currentUsage: {
        executionsThisHour: number;
        resetTime: string;
      };
    }>('/api/execution/limits');
    return response.data;
  }

  /**
   * Get execution history for current user
   */
  async getExecutionHistory(
    limit: number = 20,
    offset: number = 0
  ): Promise<{
    executions: Array<{
      id: string;
      code: string;
      language: ProgrammingLanguage;
      result: ExecutionResult;
      createdAt: string;
    }>;
    total: number;
  }> {
    const response = await apiClient.get<{
      executions: Array<{
        id: string;
        code: string;
        language: ProgrammingLanguage;
        result: ExecutionResult;
        createdAt: string;
      }>;
      total: number;
    }>(`/api/execution/history?limit=${limit}&offset=${offset}`);
    return response.data;
  }

  /**
   * Save code snippet for later use
   */
  async saveCodeSnippet(
    code: string,
    language: ProgrammingLanguage,
    title?: string,
    description?: string,
    tags?: string[]
  ): Promise<{ id: string }> {
    const response = await apiClient.post<{ id: string }>('/api/execution/snippets', {
      code,
      language,
      title,
      description,
      tags,
    });
    return response.data;
  }

  /**
   * Get saved code snippets
   */
  async getCodeSnippets(
    language?: ProgrammingLanguage,
    tags?: string[],
    limit: number = 20
  ): Promise<{
    snippets: Array<{
      id: string;
      title: string;
      description?: string;
      code: string;
      language: ProgrammingLanguage;
      tags: string[];
      createdAt: string;
      updatedAt: string;
    }>;
  }> {
    const queryParams = new URLSearchParams();
    if (language) queryParams.append('language', language);
    if (tags) tags.forEach(tag => queryParams.append('tags', tag));
    queryParams.append('limit', limit.toString());

    const response = await apiClient.get<{
      snippets: Array<{
        id: string;
        title: string;
        description?: string;
        code: string;
        language: ProgrammingLanguage;
        tags: string[];
        createdAt: string;
        updatedAt: string;
      }>;
    }>(`/api/execution/snippets?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Delete code snippet
   */
  async deleteCodeSnippet(snippetId: string): Promise<void> {
    await apiClient.delete(`/api/execution/snippets/${snippetId}`);
  }

  /**
   * Get code execution statistics
   */
  async getExecutionStats(): Promise<{
    totalExecutions: number;
    executionsByLanguage: Record<ProgrammingLanguage, number>;
    averageExecutionTime: number;
    successRate: number;
    mostUsedLanguage: ProgrammingLanguage;
    recentActivity: Array<{
      date: string;
      executions: number;
    }>;
  }> {
    const response = await apiClient.get<{
      totalExecutions: number;
      executionsByLanguage: Record<ProgrammingLanguage, number>;
      averageExecutionTime: number;
      successRate: number;
      mostUsedLanguage: ProgrammingLanguage;
      recentActivity: Array<{
        date: string;
        executions: number;
      }>;
    }>('/api/execution/stats');
    return response.data;
  }

  /**
   * Validate code syntax without execution
   */
  async validateSyntax(
    code: string,
    language: ProgrammingLanguage
  ): Promise<{
    isValid: boolean;
    errors: Array<{
      line: number;
      column: number;
      message: string;
      severity: 'error' | 'warning';
    }>;
  }> {
    const response = await apiClient.post<{
      isValid: boolean;
      errors: Array<{
        line: number;
        column: number;
        message: string;
        severity: 'error' | 'warning';
      }>;
    }>('/api/execution/validate', {
      code,
      language,
    });
    return response.data;
  }
}

// Export singleton instance
export const executionService = new ExecutionService();
export default executionService;