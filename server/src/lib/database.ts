import { PrismaClient } from '../generated/prisma';

// Singleton pattern for Prisma client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

// Utility function to handle database connections
export const connectDB = async () => {
  try {
    await db.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

// Utility function to disconnect from database
export const disconnectDB = async () => {
  await db.$disconnect();
  console.log('📡 Database disconnected');
};

// Health check function
export const checkDBHealth = async () => {
  try {
    await db.$queryRaw`SELECT 1`;
    return { status: 'healthy', timestamp: new Date() };
  } catch (error) {
    console.error('Database health check failed:', error);
    return { status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Export types for use in other parts of the application
export type {
  User,
  Track,
  Lesson,
  Challenge,
  Submission,
  Progress,
  ChatHistory,
  UserRole,
  DifficultyLevel,
  ProgrammingLanguage,
  SubmissionStatus,
  ProgressStatus,
  ChatRole,
} from '../generated/prisma';
