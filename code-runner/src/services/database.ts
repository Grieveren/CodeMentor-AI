// import { PrismaClient } from '@prisma/client';
import { config } from '../config.js';
import { TestCase } from '../types.js';

// Mock PrismaClient for testing
class MockPrismaClient {
  challenge = {
    findUnique: async (query: any) => ({
      id: query.where.id || 'test-challenge-1',
      title: 'Mocked Challenge',
      testCases: [
        { input: '1 2', expected: '3', description: 'Add two numbers' },
        { input: '5 7', expected: '12', description: 'Add two larger numbers' },
      ],
      isPublished: true,
    }),
  };
  
  submission = {
    create: async (data: any) => ({
      id: `submission-${Date.now()}`,
      ...data.data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    
    update: async (data: any) => ({
      id: data.where.id,
      ...data.data,
      createdAt: new Date(Date.now() - 1000),
      updatedAt: new Date(),
    }),
    
    findUnique: async (data: any) => ({
      id: data.where.id,
      challengeId: 'test-challenge-1',
      userId: 'anonymous',
      code: 'console.log("test");',
      language: 'javascript',
      status: 'COMPLETED',
      challenge: {
        id: 'test-challenge-1',
        title: 'Test Challenge',
        language: 'javascript',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  };
  
  $disconnect = async () => {};
}

export class DatabaseService {
  private prisma: MockPrismaClient;

  constructor() {
    // Use mock instead of real PrismaClient
    this.prisma = new MockPrismaClient();
    console.log('Using mocked database service');
  }

  async getChallengeTestCases(challengeId: string): Promise<TestCase[]> {
    try {
      const challenge = await this.prisma.challenge.findUnique({
        where: { id: challengeId },
        select: {
          id: true,
          title: true,
          testCases: true,
          isPublished: true,
        },
      });

      if (!challenge) {
        throw new Error(`Challenge with ID ${challengeId} not found`);
      }

      if (!challenge.isPublished) {
        throw new Error(`Challenge with ID ${challengeId} is not published`);
      }

      // Parse test cases from JSON
      const testCases = challenge.testCases as any[];
      
      return testCases.map((testCase, index) => ({
        input: testCase.input || '',
        expected: testCase.expected || testCase.output || '',
        description: testCase.description || `Test case ${index + 1}`,
      }));
    } catch (error) {
      console.error('Error fetching challenge test cases:', error);
      throw error;
    }
  }

  async createSubmission(data: {
    challengeId: string;
    userId: string;
    code: string;
    language: string;
    status: string;
    output?: string;
    error?: string;
    executionTime?: number;
    memoryUsage?: number;
    testResults?: any;
    score?: number;
  }) {
    try {
      const submission = await this.prisma.submission.create({
        data: {
          challengeId: data.challengeId,
          userId: data.userId,
          code: data.code,
          language: data.language,
          status: data.status,
          output: data.output,
          error: data.error,
          executionTime: data.executionTime,
          memoryUsage: data.memoryUsage,
          testResults: data.testResults,
          score: data.score,
        },
      });

      return submission;
    } catch (error) {
      console.error('Error creating submission:', error);
      throw error;
    }
  }

  async updateSubmission(submissionId: string, data: {
    status?: string;
    output?: string;
    error?: string;
    executionTime?: number;
    memoryUsage?: number;
    testResults?: any;
    score?: number;
  }) {
    try {
      const submission = await this.prisma.submission.update({
        where: { id: submissionId },
        data: {
          status: data.status,
          output: data.output,
          error: data.error,
          executionTime: data.executionTime,
          memoryUsage: data.memoryUsage,
          testResults: data.testResults,
          score: data.score,
          updatedAt: new Date(),
        },
      });

      return submission;
    } catch (error) {
      console.error('Error updating submission:', error);
      throw error;
    }
  }

  async getSubmission(submissionId: string) {
    try {
      const submission = await this.prisma.submission.findUnique({
        where: { id: submissionId },
        include: {
          challenge: {
            select: {
              id: true,
              title: true,
              language: true,
            },
          },
        },
      });

      return submission;
    } catch (error) {
      console.error('Error fetching submission:', error);
      throw error;
    }
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }
}

export const databaseService = new DatabaseService();
