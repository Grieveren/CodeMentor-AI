import { RedisService } from '../redis.js';
import { Redis } from 'ioredis';

// Mock ioredis
jest.mock('ioredis');

describe('RedisService', () => {
  let redisService: RedisService;
  let mockRedis: jest.Mocked<Redis>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock Redis client
    const MockRedis = Redis as jest.MockedClass<typeof Redis>;
    mockRedis = new MockRedis() as jest.Mocked<Redis>;
    
    // Mock Redis methods
    mockRedis.publish = jest.fn().mockResolvedValue(1);
    mockRedis.setex = jest.fn().mockResolvedValue('OK');
    mockRedis.get = jest.fn().mockResolvedValue(null);
    mockRedis.set = jest.fn().mockResolvedValue('OK');
    mockRedis.del = jest.fn().mockResolvedValue(1);
    mockRedis.disconnect = jest.fn().mockResolvedValue(undefined);
    mockRedis.on = jest.fn().mockReturnValue(mockRedis);
    
    // Mock the constructor to return our mocked client
    MockRedis.mockImplementation(() => mockRedis);
    
    redisService = new RedisService();
  });

  describe('publishExecutionUpdate', () => {
    it('should publish execution update event', async () => {
      const event = {
        submissionId: 'test-submission-id',
        challengeId: 'test-challenge-id',
        status: 'RUNNING' as const,
        progress: {
          totalTests: 5,
          completedTests: 2,
          passedTests: 1,
          failedTests: 1,
        },
      };

      await redisService.publishExecutionUpdate(event);

      expect(mockRedis.publish).toHaveBeenCalledWith(
        'execution:update',
        JSON.stringify(event)
      );
    });

    it('should handle publish errors', async () => {
      const event = {
        submissionId: 'test-submission-id',
        challengeId: 'test-challenge-id',
        status: 'RUNNING' as const,
        progress: {
          totalTests: 5,
          completedTests: 2,
          passedTests: 1,
          failedTests: 1,
        },
      };

      mockRedis.publish.mockRejectedValue(new Error('Redis error'));

      await expect(
        redisService.publishExecutionUpdate(event)
      ).rejects.toThrow('Redis error');
    });
  });

  describe('publishExecutionComplete', () => {
    it('should publish execution complete event', async () => {
      const result = {
        id: 'test-submission-id',
        status: 'COMPLETED',
        score: 100,
      };

      await redisService.publishExecutionComplete('test-submission-id', result);

      expect(mockRedis.publish).toHaveBeenCalledWith(
        'execution:complete',
        JSON.stringify({
          submissionId: 'test-submission-id',
          type: 'execution_complete',
          result,
          timestamp: expect.any(String),
        })
      );
    });
  });

  describe('publishExecutionError', () => {
    it('should publish execution error event', async () => {
      const error = 'Test error message';

      await redisService.publishExecutionError('test-submission-id', error);

      expect(mockRedis.publish).toHaveBeenCalledWith(
        'execution:error',
        JSON.stringify({
          submissionId: 'test-submission-id',
          type: 'execution_error',
          error,
          timestamp: expect.any(String),
        })
      );
    });
  });

  describe('cacheSubmissionResult', () => {
    it('should cache submission result with default TTL', async () => {
      const result = {
        id: 'test-submission-id',
        status: 'COMPLETED',
        score: 100,
      };

      await redisService.cacheSubmissionResult('test-submission-id', result);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'submission:test-submission-id',
        3600,
        JSON.stringify(result)
      );
    });

    it('should cache submission result with custom TTL', async () => {
      const result = {
        id: 'test-submission-id',
        status: 'COMPLETED',
        score: 100,
      };

      await redisService.cacheSubmissionResult('test-submission-id', result, 1800);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'submission:test-submission-id',
        1800,
        JSON.stringify(result)
      );
    });

    it('should handle cache errors', async () => {
      const result = {
        id: 'test-submission-id',
        status: 'COMPLETED',
        score: 100,
      };

      mockRedis.setex.mockRejectedValue(new Error('Cache error'));

      await expect(
        redisService.cacheSubmissionResult('test-submission-id', result)
      ).rejects.toThrow('Cache error');
    });
  });

  describe('getCachedSubmissionResult', () => {
    it('should return cached submission result', async () => {
      const cachedResult = {
        id: 'test-submission-id',
        status: 'COMPLETED',
        score: 100,
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(cachedResult));

      const result = await redisService.getCachedSubmissionResult('test-submission-id');

      expect(result).toEqual(cachedResult);
      expect(mockRedis.get).toHaveBeenCalledWith('submission:test-submission-id');
    });

    it('should return null when no cached result exists', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await redisService.getCachedSubmissionResult('test-submission-id');

      expect(result).toBeNull();
    });

    it('should handle cache retrieval errors', async () => {
      mockRedis.get.mockRejectedValue(new Error('Cache error'));

      const result = await redisService.getCachedSubmissionResult('test-submission-id');

      expect(result).toBeNull();
    });
  });

  describe('setExecutionLock', () => {
    it('should set execution lock successfully', async () => {
      mockRedis.set.mockResolvedValue('OK');

      const result = await redisService.setExecutionLock('test-submission-id');

      expect(result).toBe(true);
      expect(mockRedis.set).toHaveBeenCalledWith(
        'execution:lock:test-submission-id',
        '1',
        'EX',
        300,
        'NX'
      );
    });

    it('should set execution lock with custom TTL', async () => {
      mockRedis.set.mockResolvedValue('OK');

      const result = await redisService.setExecutionLock('test-submission-id', 600);

      expect(result).toBe(true);
      expect(mockRedis.set).toHaveBeenCalledWith(
        'execution:lock:test-submission-id',
        '1',
        'EX',
        600,
        'NX'
      );
    });

    it('should return false when lock already exists', async () => {
      mockRedis.set.mockResolvedValue(null);

      const result = await redisService.setExecutionLock('test-submission-id');

      expect(result).toBe(false);
    });

    it('should handle lock setting errors', async () => {
      mockRedis.set.mockRejectedValue(new Error('Lock error'));

      const result = await redisService.setExecutionLock('test-submission-id');

      expect(result).toBe(false);
    });
  });

  describe('releaseExecutionLock', () => {
    it('should release execution lock', async () => {
      mockRedis.del.mockResolvedValue(1);

      await redisService.releaseExecutionLock('test-submission-id');

      expect(mockRedis.del).toHaveBeenCalledWith('execution:lock:test-submission-id');
    });

    it('should handle lock release errors', async () => {
      mockRedis.del.mockRejectedValue(new Error('Lock error'));

      // Should not throw error
      await expect(
        redisService.releaseExecutionLock('test-submission-id')
      ).resolves.not.toThrow();
    });
  });

  describe('disconnect', () => {
    it('should disconnect from Redis', async () => {
      mockRedis.disconnect.mockResolvedValue(undefined);

      await redisService.disconnect();

      expect(mockRedis.disconnect).toHaveBeenCalled();
    });
  });
});
