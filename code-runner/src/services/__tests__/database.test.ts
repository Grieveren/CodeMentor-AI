import { DatabaseService } from '../database.js';
import { PrismaClient } from '@prisma/client';

// Mock Prisma Client
jest.mock('@prisma/client');

describe('DatabaseService', () => {
  let databaseService: DatabaseService;
  let mockPrismaClient: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock Prisma Client
    const MockPrismaClient = PrismaClient as jest.MockedClass<typeof PrismaClient>;
    mockPrismaClient = new MockPrismaClient() as jest.Mocked<PrismaClient>;
    
    // Mock the constructor to return our mocked client
    MockPrismaClient.mockImplementation(() => mockPrismaClient);
    
    databaseService = new DatabaseService();
  });

  describe('getChallengeTestCases', () => {
    it('should return test cases for a valid challenge', async () => {
      const mockChallenge = {
        id: 'test-challenge-id',
        title: 'Test Challenge',
        testCases: [
          { input: '', expected: 'Hello World', description: 'Test case 1' },
          { input: 'test', expected: 'Hello test', description: 'Test case 2' },
        ],
        isPublished: true,
      };

      mockPrismaClient.challenge = {
        findUnique: jest.fn().mockResolvedValue(mockChallenge),
      } as any;

      const result = await databaseService.getChallengeTestCases('test-challenge-id');

      expect(result).toEqual([
        { input: '', expected: 'Hello World', description: 'Test case 1' },
        { input: 'test', expected: 'Hello test', description: 'Test case 2' },
      ]);

      expect(mockPrismaClient.challenge.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-challenge-id' },
        select: {
          id: true,
          title: true,
          testCases: true,
          isPublished: true,
        },
      });
    });

    it('should throw error for non-existent challenge', async () => {
      mockPrismaClient.challenge = {
        findUnique: jest.fn().mockResolvedValue(null),
      } as any;

      await expect(
        databaseService.getChallengeTestCases('non-existent-id')
      ).rejects.toThrow('Challenge with ID non-existent-id not found');
    });

    it('should throw error for unpublished challenge', async () => {
      const mockChallenge = {
        id: 'test-challenge-id',
        title: 'Test Challenge',
        testCases: [],
        isPublished: false,
      };

      mockPrismaClient.challenge = {
        findUnique: jest.fn().mockResolvedValue(mockChallenge),
      } as any;

      await expect(
        databaseService.getChallengeTestCases('test-challenge-id')
      ).rejects.toThrow('Challenge with ID test-challenge-id is not published');
    });

    it('should handle test cases with legacy output field', async () => {
      const mockChallenge = {
        id: 'test-challenge-id',
        title: 'Test Challenge',
        testCases: [
          { input: '', output: 'Hello World', description: 'Test case 1' },
          { input: 'test', expected: 'Hello test', description: 'Test case 2' },
        ],
        isPublished: true,
      };

      mockPrismaClient.challenge = {
        findUnique: jest.fn().mockResolvedValue(mockChallenge),
      } as any;

      const result = await databaseService.getChallengeTestCases('test-challenge-id');

      expect(result).toEqual([
        { input: '', expected: 'Hello World', description: 'Test case 1' },
        { input: 'test', expected: 'Hello test', description: 'Test case 2' },
      ]);
    });

    it('should provide default descriptions for test cases', async () => {
      const mockChallenge = {
        id: 'test-challenge-id',
        title: 'Test Challenge',
        testCases: [
          { input: '', expected: 'Hello World' },
          { input: 'test', expected: 'Hello test' },
        ],
        isPublished: true,
      };

      mockPrismaClient.challenge = {
        findUnique: jest.fn().mockResolvedValue(mockChallenge),
      } as any;

      const result = await databaseService.getChallengeTestCases('test-challenge-id');

      expect(result).toEqual([
        { input: '', expected: 'Hello World', description: 'Test case 1' },
        { input: 'test', expected: 'Hello test', description: 'Test case 2' },
      ]);
    });
  });

  describe('createSubmission', () => {
    it('should create a new submission', async () => {
      const mockSubmission = {
        id: 'test-submission-id',
        challengeId: 'test-challenge-id',
        userId: 'test-user-id',
        code: 'console.log(\"Hello World\");',
        language: 'javascript',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.submission = {
        create: jest.fn().mockResolvedValue(mockSubmission),
      } as any;

      const submissionData = {
        challengeId: 'test-challenge-id',
        userId: 'test-user-id',
        code: 'console.log(\"Hello World\");',
        language: 'javascript',
        status: 'PENDING',
      };

      const result = await databaseService.createSubmission(submissionData);

      expect(result).toEqual(mockSubmission);
      expect(mockPrismaClient.submission.create).toHaveBeenCalledWith({
        data: submissionData,
      });
    });

    it('should handle creation errors', async () => {
      mockPrismaClient.submission = {
        create: jest.fn().mockRejectedValue(new Error('Database error')),
      } as any;

      const submissionData = {
        challengeId: 'test-challenge-id',
        userId: 'test-user-id',
        code: 'console.log(\"Hello World\");',
        language: 'javascript',
        status: 'PENDING',
      };

      await expect(
        databaseService.createSubmission(submissionData)
      ).rejects.toThrow('Database error');
    });
  });

  describe('updateSubmission', () => {
    it('should update an existing submission', async () => {
      const mockUpdatedSubmission = {
        id: 'test-submission-id',
        status: 'COMPLETED',
        score: 100,
        updatedAt: new Date(),
      };

      mockPrismaClient.submission = {
        update: jest.fn().mockResolvedValue(mockUpdatedSubmission),
      } as any;

      const updateData = {
        status: 'COMPLETED',
        score: 100,
      };

      const result = await databaseService.updateSubmission('test-submission-id', updateData);

      expect(result).toEqual(mockUpdatedSubmission);
      expect(mockPrismaClient.submission.update).toHaveBeenCalledWith({
        where: { id: 'test-submission-id' },
        data: {
          ...updateData,
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should handle update errors', async () => {
      mockPrismaClient.submission = {
        update: jest.fn().mockRejectedValue(new Error('Submission not found')),
      } as any;

      await expect(
        databaseService.updateSubmission('non-existent-id', { status: 'COMPLETED' })
      ).rejects.toThrow('Submission not found');
    });
  });

  describe('getSubmission', () => {
    it('should retrieve a submission with challenge details', async () => {
      const mockSubmission = {
        id: 'test-submission-id',
        challengeId: 'test-challenge-id',
        userId: 'test-user-id',
        code: 'console.log(\"Hello World\");',
        language: 'javascript',
        status: 'COMPLETED',
        challenge: {
          id: 'test-challenge-id',
          title: 'Test Challenge',
          language: 'javascript',
        },
      };

      mockPrismaClient.submission = {
        findUnique: jest.fn().mockResolvedValue(mockSubmission),
      } as any;

      const result = await databaseService.getSubmission('test-submission-id');

      expect(result).toEqual(mockSubmission);
      expect(mockPrismaClient.submission.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-submission-id' },
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
    });

    it('should handle non-existent submission', async () => {
      mockPrismaClient.submission = {
        findUnique: jest.fn().mockResolvedValue(null),
      } as any;

      const result = await databaseService.getSubmission('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('disconnect', () => {
    it('should disconnect from the database', async () => {
      mockPrismaClient.$disconnect = jest.fn().mockResolvedValue(undefined);

      await databaseService.disconnect();

      expect(mockPrismaClient.$disconnect).toHaveBeenCalled();
    });
  });
});
