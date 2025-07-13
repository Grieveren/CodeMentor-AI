import { PrismaClient } from '../../generated/prisma/index.js';

const prisma = new PrismaClient();

export class ProgressService {
  async getUserProgress(userId: string) {
    return await prisma.progress.findMany({
      where: { userId },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            trackId: true,
            difficulty: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async updateLessonProgress(
    userId: string,
    lessonId: string,
    progressData: {
      completed?: boolean;
      score?: number;
      timeSpent?: number;
    }
  ) {
    return await prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        ...progressData,
        updatedAt: new Date(),
      },
      create: {
        userId,
        lessonId,
        ...progressData,
      },
    });
  }

  async getProgressStats(userId: string) {
    const totalProgress = await prisma.progress.count({
      where: { userId },
    });

    const completedLessons = await prisma.progress.count({
      where: {
        userId,
        status: 'COMPLETED',
      },
    });

    const averageScore = await prisma.progress.aggregate({
      where: {
        userId,
        score: { not: null },
      },
      _avg: {
        score: true,
      },
    });

    const totalTimeSpent = await prisma.progress.aggregate({
      where: {
        userId,
        timeSpent: { gt: 0 },
      },
      _sum: {
        timeSpent: true,
      },
    });

    return {
      totalProgress,
      completedLessons,
      averageScore: averageScore._avg.score || 0,
      totalTimeSpent: totalTimeSpent._sum?.timeSpent || 0,
      completionRate: totalProgress > 0 ? (completedLessons / totalProgress) * 100 : 0,
    };
  }
}
