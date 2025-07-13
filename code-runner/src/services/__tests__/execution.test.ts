import { ExecutionService } from '../execution.js';
import { databaseService } from '../database.js';
import { redisService } from '../redis.js';
import { RestClient } from '@codementor-ai/code-executor-client';

// Mock dependencies
jest.mock('../database.js');
jest.mock('../redis.js');
jest.mock('@codementor-ai/code-executor-client');

describe('ExecutionService', () => {
  let executionService: ExecutionService;
  let mockDatabaseService: jest.Mocked<typeof databaseService>;
  let mockRedisService: jest.Mocked<typeof redisService>;
  let mockRestClient: jest.Mocked<RestClient>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock database service
    mockDatabaseService = databaseService as jest.Mocked<typeof databaseService>;
    mockDatabaseService.createSubmission.mockResolvedValue({
      id: 'test-submission-id',
      challengeId: 'test-challenge-id',
      userId: 'test-user-id',
      code: 'console.log(\"Hello World\");',
      language: 'javascript',
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    mockDatabaseService.getChallengeTestCases.mockResolvedValue([
      { input: '', expected: 'Hello World', description: 'Test case 1' },
      { input: 'test', expected: 'Hello test', description: 'Test case 2' },
    ]);

    mockDatabaseService.updateSubmission.mockResolvedValue({} as any);

    // Mock Redis service
    mockRedisService = redisService as jest.Mocked<typeof redisService>;
    mockRedisService.setExecutionLock.mockResolvedValue(true);
    mockRedisService.publishExecutionUpdate.mockResolvedValue();
    mockRedisService.publishExecutionComplete.mockResolvedValue();
    mockRedisService.cacheSubmissionResult.mockResolvedValue();
    mockRedisService.releaseExecutionLock.mockResolvedValue();

    // Mock RestClient
    const MockRestClient = RestClient as jest.MockedClass<typeof RestClient>;
    mockRestClient = new MockRestClient({} as any) as jest.Mocked<RestClient>;
    mockRestClient.execute.mockResolvedValue({
      stdout: 'Hello World',
      stderr: '',
      exitCode: 0,
      timeout: false,
      memoryExceeded: false,
      executionTimeMs: 100,
      memoryUsedMb: 10,
    });

    // Mock the constructor to return our mocked client
    MockRestClient.mockImplementation(() => mockRestClient);

    executionService = new ExecutionService();
  });

  describe('executeCode', () => {
    it('should execute code successfully with all tests passing', async () => {
      const result = await executionService.executeCode(
        'test-challenge-id',
        'console.log(\"Hello World\");',
        'javascript',
        '',
        'test-user-id'
      );

      expect(result).toEqual({
        id: 'test-submission-id',
        status: 'COMPLETED',
        totalTests: 2,
        passedTests: 2,
        failedTests: 0,
        score: 100,
        executionTimeMs: 200,
        memoryUsedMb: 10,
        results: expect.arrayContaining([
          expect.objectContaining({
            passed: true,
            executionTimeMs: 100,
            memoryUsedMb: 10,
          }),
        ]),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      expect(mockDatabaseService.createSubmission).toHaveBeenCalledWith({
        challengeId: 'test-challenge-id',
        userId: 'test-user-id',
        code: 'console.log(\"Hello World\");',
        language: 'javascript',
        status: 'PENDING',
      });

      expect(mockDatabaseService.getChallengeTestCases).toHaveBeenCalledWith('test-challenge-id');
      expect(mockRestClient.execute).toHaveBeenCalledTimes(2);
      expect(mockRedisService.publishExecutionUpdate).toHaveBeenCalled();
      expect(mockRedisService.publishExecutionComplete).toHaveBeenCalled();
    });

    it('should handle execution failure', async () => {
      mockRestClient.execute.mockRejectedValue(new Error('Execution failed'));

      const result = await executionService.executeCode(
        'test-challenge-id',
        'invalid code',
        'javascript',
        '',
        'test-user-id'
      );

      expect(result.status).toBe('FAILED');
      expect(result.passedTests).toBe(0);
      expect(result.failedTests).toBe(2);
      expect(result.score).toBe(0);
      expect(mockRedisService.publishExecutionError).toHaveBeenCalled();
    });

    it('should handle challenge not found', async () => {
      mockDatabaseService.getChallengeTestCases.mockRejectedValue(
        new Error('Challenge with ID test-challenge-id not found')
      );

      await expect(
        executionService.executeCode(
          'test-challenge-id',
          'console.log(\"Hello World\");',
          'javascript',
          '',
          'test-user-id'
        )
      ).rejects.toThrow('Challenge with ID test-challenge-id not found');
    });

    it('should handle execution lock failure', async () => {
      mockRedisService.setExecutionLock.mockResolvedValue(false);

      await expect(
        executionService.executeCode(
          'test-challenge-id',
          'console.log(\"Hello World\");',
          'javascript',
          '',
          'test-user-id'
        )
      ).rejects.toThrow('Execution already in progress for this submission');
    });

    it('should handle partial test success', async () => {
      mockRestClient.execute
        .mockResolvedValueOnce({
          stdout: 'Hello World',
          stderr: '',
          exitCode: 0,
          timeout: false,
          memoryExceeded: false,
          executionTimeMs: 100,
          memoryUsedMb: 10,
        })
        .mockResolvedValueOnce({
          stdout: 'Wrong output',
          stderr: '',
          exitCode: 0,
          timeout: false,
          memoryExceeded: false,
          executionTimeMs: 150,
          memoryUsedMb: 12,
        });

      const result = await executionService.executeCode(
        'test-challenge-id',
        'console.log(\"Hello World\");',
        'javascript',
        '',
        'test-user-id'
      );

      expect(result.status).toBe('COMPLETED');
      expect(result.totalTests).toBe(2);
      expect(result.passedTests).toBe(1);
      expect(result.failedTests).toBe(1);
      expect(result.score).toBe(50);
    });

    it('should handle timeout and memory exceeded', async () => {
      mockRestClient.execute.mockResolvedValue({
        stdout: '',
        stderr: 'Timeout exceeded',
        exitCode: 124,
        timeout: true,
        memoryExceeded: true,
        executionTimeMs: 30000,
        memoryUsedMb: 128,
      });

      const result = await executionService.executeCode(
        'test-challenge-id',
        'while(true) {}',
        'javascript',
        '',
        'test-user-id'
      );

      expect(result.status).toBe('FAILED');
      expect(result.results.every(r => r.timeout)).toBe(true);
      expect(result.results.every(r => r.memoryExceeded)).toBe(true);
    });
  });
});
