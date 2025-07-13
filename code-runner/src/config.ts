import dotenv from 'dotenv';
import { z } from 'zod';
import { Config } from './types.js';

dotenv.config();

const configSchema = z.object({
  // App configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3002'),
  HOST: z.string().default('localhost'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  API_KEY: z.string().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Database configuration
  DATABASE_URL: z.string().url(),

  // Redis configuration
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().transform(Number).default('0'),

  // Code executor configuration
  CODE_EXECUTOR_HOST: z.string().default('localhost'),
  CODE_EXECUTOR_PORT: z.string().transform(Number).default('8080'),
  CODE_EXECUTOR_PROTOCOL: z.enum(['http', 'https']).default('http'),
  CODE_EXECUTOR_MAX_CONCURRENT: z.string().transform(Number).default('5'),
  CODE_EXECUTOR_TIMEOUT_SECONDS: z.string().transform(Number).default('30'),
  CODE_EXECUTOR_MEMORY_LIMIT_MB: z.string().transform(Number).default('128'),
});

const parseConfig = (): Config => {
  const parsed = configSchema.safeParse(process.env);
  
  if (!parsed.success) {
    console.error('Configuration validation failed:');
    console.error(parsed.error.errors);
    throw new Error('Invalid configuration');
  }

  const env = parsed.data;

  return {
    app: {
      port: env.PORT,
      host: env.HOST,
      corsOrigin: env.CORS_ORIGIN,
      apiKey: env.API_KEY || '',
      nodeEnv: env.NODE_ENV,
      logLevel: env.LOG_LEVEL,
    },
    database: {
      url: env.DATABASE_URL,
    },
    redis: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      ...(env.REDIS_PASSWORD && { password: env.REDIS_PASSWORD }),
      db: env.REDIS_DB,
    },
    codeExecutor: {
      host: env.CODE_EXECUTOR_HOST,
      port: env.CODE_EXECUTOR_PORT,
      protocol: env.CODE_EXECUTOR_PROTOCOL,
      maxConcurrent: env.CODE_EXECUTOR_MAX_CONCURRENT,
      timeoutSeconds: env.CODE_EXECUTOR_TIMEOUT_SECONDS,
      memoryLimitMb: env.CODE_EXECUTOR_MEMORY_LIMIT_MB,
    },
  };
};

export const config = parseConfig();
