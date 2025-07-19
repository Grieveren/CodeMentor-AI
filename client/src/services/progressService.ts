import { apiClient } from './apiClient';
import type {
  UserProgress,
  ProgressUpdate,
  ProgressStats,
  Achievement,
  CategoryProgress,
} from '@/types';

export interface ProgressFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
  timeframe?: 'daily' | 'weekly' | 'monthly';
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  avatar?: string;
  score: number;
  rank: number;
  lessonsCompleted: number;
  challengesCompleted: number;
  currentStreak: number;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  streakStartDate: string;
  lastActivityDate: string;
  isActiveToday: boolean;
}

export class ProgressService {
  /**
   * Get current user's progress
   */
  async getUserProgress(): Promise<UserProgress> {
    const response = await apiClient.get<UserProgress>('/api/progress');
    return response.data;
  }

  /**
   * Update lesson progress
   */
  async updateLessonProgress(lessonId: string, update: ProgressUpdate): Promise<void> {
    await apiClient.post(`/api/progress/lessons/${lessonId}`, update);
  }

  /**
   * Update challenge progress
   */
  async updateChallengeProgress(challengeId: string, update: ProgressUpdate): Promise<void> {
    await apiClient.post(`/api/progress/challenges/${challengeId}`, update);
  }

  /**
   * Mark lesson as completed
   */
  async completeLesson(lessonId: string, timeSpent: number, score?: number): Promise<void> {
    await apiClient.post(`/api/progress/lessons/${lessonId}/complete`, {
      timeSpent,
      score,
    });
  }

  /**
   * Mark challenge as completed
   */
  async completeChallenge(challengeId: string, timeSpent: number, score: number): Promise<void> {
    await apiClient.post(`/api/progress/challenges/${challengeId}/complete`, {
      timeSpent,
      score,
    });
  }

  /**
   * Get progress statistics with filtering
   */
  async getProgressStats(filters?: ProgressFilters): Promise<ProgressStats> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get<ProgressStats>(
      `/api/progress/stats?${queryParams.toString()}`
    );
    return response.data;
  }

  /**
   * Get progress by category
   */
  async getCategoryProgress(): Promise<CategoryProgress[]> {
    const response = await apiClient.get<CategoryProgress[]>('/api/progress/categories');
    return response.data;
  }

  /**
   * Get user achievements
   */
  async getAchievements(): Promise<Achievement[]> {
    const response = await apiClient.get<Achievement[]>('/api/progress/achievements');
    return response.data;
  }

  /**
   * Get available achievements (including locked ones)
   */
  async getAllAchievements(): Promise<Array<Achievement & { unlocked: boolean }>> {
    const response = await apiClient.get<Array<Achievement & { unlocked: boolean }>>(
      '/api/progress/achievements/all'
    );
    return response.data;
  }

  /**
   * Get streak information
   */
  async getStreakInfo(): Promise<StreakInfo> {
    const response = await apiClient.get<StreakInfo>('/api/progress/streak');
    return response.data;
  }

  /**
   * Update daily activity (maintain streak)
   */
  async updateDailyActivity(): Promise<StreakInfo> {
    const response = await apiClient.post<StreakInfo>('/api/progress/activity');
    return response.data;
  }

  /**
   * Get learning path progress
   */
  async getLearningPathProgress(pathId: string): Promise<{
    pathId: string;
    pathTitle: string;
    totalLessons: number;
    completedLessons: number;
    progress: number;
    estimatedTimeRemaining: number;
    nextLesson?: {
      id: string;
      title: string;
      estimatedTime: number;
    };
  }> {
    const response = await apiClient.get<{
      pathId: string;
      pathTitle: string;
      totalLessons: number;
      completedLessons: number;
      progress: number;
      estimatedTimeRemaining: number;
      nextLesson?: {
        id: string;
        title: string;
        estimatedTime: number;
      };
    }>(`/api/progress/paths/${pathId}`);
    return response.data;
  }

  /**
   * Get skill level progress
   */
  async getSkillLevels(): Promise<Record<string, {
    level: number;
    experience: number;
    experienceToNext: number;
    totalExperience: number;
  }>> {
    const response = await apiClient.get<Record<string, {
      level: number;
      experience: number;
      experienceToNext: number;
      totalExperience: number;
    }>>('/api/progress/skills');
    return response.data;
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(
    timeframe: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'weekly',
    limit: number = 50
  ): Promise<{
    leaderboard: LeaderboardEntry[];
    userRank?: LeaderboardEntry;
    totalParticipants: number;
  }> {
    const response = await apiClient.get<{
      leaderboard: LeaderboardEntry[];
      userRank?: LeaderboardEntry;
      totalParticipants: number;
    }>(`/api/progress/leaderboard?timeframe=${timeframe}&limit=${limit}`);
    return response.data;
  }

  /**
   * Get progress comparison with peers
   */
  async getProgressComparison(): Promise<{
    userProgress: {
      lessonsCompleted: number;
      challengesCompleted: number;
      timeSpent: number;
      averageScore: number;
    };
    peerAverage: {
      lessonsCompleted: number;
      challengesCompleted: number;
      timeSpent: number;
      averageScore: number;
    };
    percentile: number;
  }> {
    const response = await apiClient.get<{
      userProgress: {
        lessonsCompleted: number;
        challengesCompleted: number;
        timeSpent: number;
        averageScore: number;
      };
      peerAverage: {
        lessonsCompleted: number;
        challengesCompleted: number;
        timeSpent: number;
        averageScore: number;
      };
      percentile: number;
    }>('/api/progress/comparison');
    return response.data;
  }

  /**
   * Get detailed activity log
   */
  async getActivityLog(
    limit: number = 50,
    offset: number = 0
  ): Promise<{
    activities: Array<{
      id: string;
      type: 'lesson_completed' | 'challenge_completed' | 'achievement_unlocked' | 'streak_milestone';
      title: string;
      description: string;
      points: number;
      timestamp: string;
      metadata?: Record<string, any>;
    }>;
    total: number;
  }> {
    const response = await apiClient.get<{
      activities: Array<{
        id: string;
        type: 'lesson_completed' | 'challenge_completed' | 'achievement_unlocked' | 'streak_milestone';
        title: string;
        description: string;
        points: number;
        timestamp: string;
        metadata?: Record<string, any>;
      }>;
      total: number;
    }>(`/api/progress/activity-log?limit=${limit}&offset=${offset}`);
    return response.data;
  }

  /**
   * Get progress insights and recommendations
   */
  async getProgressInsights(): Promise<{
    insights: Array<{
      type: 'strength' | 'improvement' | 'recommendation';
      title: string;
      description: string;
      actionable: boolean;
      action?: string;
    }>;
    recommendations: Array<{
      type: 'lesson' | 'challenge' | 'track';
      id: string;
      title: string;
      reason: string;
      difficulty: string;
      estimatedTime: number;
    }>;
  }> {
    const response = await apiClient.get<{
      insights: Array<{
        type: 'strength' | 'improvement' | 'recommendation';
        title: string;
        description: string;
        actionable: boolean;
        action?: string;
      }>;
      recommendations: Array<{
        type: 'lesson' | 'challenge' | 'track';
        id: string;
        title: string;
        reason: string;
        difficulty: string;
        estimatedTime: number;
      }>;
    }>('/api/progress/insights');
    return response.data;
  }

  /**
   * Export progress data
   */
  async exportProgress(format: 'json' | 'csv' = 'json'): Promise<Blob> {
    const response = await apiClient.getInstance().get(`/api/progress/export?format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Set learning goals
   */
  async setLearningGoals(goals: {
    dailyLessons?: number;
    weeklyChallenges?: number;
    monthlyTimeSpent?: number; // in minutes
    targetSkills?: string[];
  }): Promise<void> {
    await apiClient.post('/api/progress/goals', goals);
  }

  /**
   * Get learning goals and progress towards them
   */
  async getLearningGoals(): Promise<{
    goals: {
      dailyLessons?: number;
      weeklyChallenges?: number;
      monthlyTimeSpent?: number;
      targetSkills?: string[];
    };
    progress: {
      dailyLessonsProgress: number;
      weeklyChallengesProgress: number;
      monthlyTimeSpentProgress: number;
      targetSkillsProgress: Record<string, number>;
    };
  }> {
    const response = await apiClient.get<{
      goals: {
        dailyLessons?: number;
        weeklyChallenges?: number;
        monthlyTimeSpent?: number;
        targetSkills?: string[];
      };
      progress: {
        dailyLessonsProgress: number;
        weeklyChallengesProgress: number;
        monthlyTimeSpentProgress: number;
        targetSkillsProgress: Record<string, number>;
      };
    }>('/api/progress/goals');
    return response.data;
  }
}

// Export singleton instance
export const progressService = new ProgressService();
export default progressService;