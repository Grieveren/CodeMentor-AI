import { PrismaClient, DifficultyLevel } from '../../generated/prisma/index.js';

const prisma = new PrismaClient();

export class LessonsService {
  async getAllLessons(options: {
    page: number;
    limit: number;
    difficulty?: string;
    category?: string;
  }) {
    const { page, limit, difficulty, category } = options;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (difficulty) where.difficulty = difficulty as DifficultyLevel;
    // Category filter removed - lessons are filtered by track instead

    return await prisma.lesson.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            challenges: true,
          },
        },
      },
    });
  }

  async getLessonById(id: string) {
    return await prisma.lesson.findUnique({
      where: { id },
      include: {
        challenges: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async createLesson(lessonData: {
    title: string;
    description: string;
    content: string;
    difficulty: string;
    trackId: string;
    estimatedTime: number;
    slug: string;
  }) {
    return await prisma.lesson.create({
      data: {
        ...lessonData,
        difficulty: lessonData.difficulty as DifficultyLevel,
      },
    });
  }

  async updateLesson(id: string, lessonData: Partial<{
    title: string;
    description: string;
    content: string;
    difficulty: string;
    trackId: string;
    estimatedTime: number;
    slug: string;
  }>) {
    try {
      const updateData: any = { ...lessonData };
      if (lessonData.difficulty) {
        updateData.difficulty = lessonData.difficulty as DifficultyLevel;
      }
      return await prisma.lesson.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      return null;
    }
  }

  async deleteLesson(id: string) {
    try {
      return await prisma.lesson.delete({
        where: { id },
      });
    } catch (error) {
      return null;
    }
  }

  async getLessonsByTrack(trackId: string, options: {
    page: number;
    limit: number;
  }) {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    return await prisma.lesson.findMany({
      where: { trackId },
      skip,
      take: limit,
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: {
            challenges: true,
          },
        },
      },
    });
  }

  async getLessonsByDifficulty(difficulty: string) {
    return await prisma.lesson.findMany({
      where: { difficulty: difficulty as DifficultyLevel },
      orderBy: { createdAt: 'desc' },
    });
  }
}
