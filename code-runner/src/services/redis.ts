// import { Redis } from 'ioredis';
// Mock Redis to avoid actual connections
class Redis {
  constructor(options?: any) {}
  async publish(channel: string, message: string): Promise<void> {}
  on(event: string, callback: (error?: any) => void): void {}
  async disconnect(): Promise<void> {}
  async del(key: string): Promise<number> { return 1; }
  async setex(key: string, ttl: number, value: string): Promise<string> { return 'OK'; }
  async get(key: string): Promise<string | null> { return null; }
  async set(key: string, value: string, ...args: any[]): Promise<string | null> { return 'OK'; }
}
import { config } from '../config.js';
import { ExecutionProgressEvent } from '../types.js';

export class RedisService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      db: config.redis.db,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.redis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    this.redis.on('connect', () => {
      console.log('Connected to Redis');
    });
  }

  async publishExecutionUpdate(event: ExecutionProgressEvent): Promise<void> {
    try {
      const message = JSON.stringify(event);
      await this.redis.publish('execution:update', message);
      console.log('Published execution update:', { 
        submissionId: event.submissionId,
        status: event.status,
        progress: event.progress 
      });
    } catch (error) {
      console.error('Error publishing execution update:', error);
      throw error;
    }
  }

  async publishExecutionComplete(submissionId: string, result: any): Promise<void> {
    try {
      const message = JSON.stringify({
        submissionId,
        type: 'execution_complete',
        result,
        timestamp: new Date().toISOString(),
      });
      await this.redis.publish('execution:complete', message);
      console.log('Published execution complete:', { submissionId });
    } catch (error) {
      console.error('Error publishing execution complete:', error);
      throw error;
    }
  }

  async publishExecutionError(submissionId: string, error: string): Promise<void> {
    try {
      const message = JSON.stringify({
        submissionId,
        type: 'execution_error',
        error,
        timestamp: new Date().toISOString(),
      });
      await this.redis.publish('execution:error', message);
      console.log('Published execution error:', { submissionId, error });
    } catch (error) {
      console.error('Error publishing execution error:', error);
      throw error;
    }
  }

  async cacheSubmissionResult(submissionId: string, result: any, ttlSeconds: number = 3600): Promise<void> {
    try {
      await this.redis.setex(
        `submission:${submissionId}`,
        ttlSeconds,
        JSON.stringify(result)
      );
    } catch (error) {
      console.error('Error caching submission result:', error);
      throw error;
    }
  }

  async getCachedSubmissionResult(submissionId: string): Promise<any | null> {
    try {
      const cached = await this.redis.get(`submission:${submissionId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting cached submission result:', error);
      return null;
    }
  }

  async setExecutionLock(submissionId: string, ttlSeconds: number = 300): Promise<boolean> {
    try {
      const result = await this.redis.set(
        `execution:lock:${submissionId}`,
        '1',
        'EX',
        ttlSeconds,
        'NX'
      );
      return result === 'OK';
    } catch (error) {
      console.error('Error setting execution lock:', error);
      return false;
    }
  }

  async releaseExecutionLock(submissionId: string): Promise<void> {
    try {
      await this.redis.del(`execution:lock:${submissionId}`);
    } catch (error) {
      console.error('Error releasing execution lock:', error);
    }
  }

  async disconnect(): Promise<void> {
    await this.redis.disconnect();
  }
}

export const redisService = new RedisService();
