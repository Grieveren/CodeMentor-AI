import { apiClient } from './apiClient';
import type {
  Lesson,
  Track,
  Category,
} from '@/types';

export interface LessonFilters {
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  search?: string;
  trackId?: string;
}

export interface LessonQueryParams extends LessonFilters {
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'difficulty' | 'createdAt' | 'estimatedTime';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class LessonsService {
  /**
   * Get all lessons with optional filtering and pagination
   */
  async getLessons(params?: LessonQueryParams): Promise<PaginatedResponse<Lesson>> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v.toString()));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }

    const response = await apiClient.get<PaginatedResponse<Lesson>>(
      `/api/lessons?${queryParams.toString()}`
    );
    return response.data;
  }

  /**
   * Get a specific lesson by ID
   */
  async getLessonById(id: string): Promise<Lesson> {
    const response = await apiClient.get<Lesson>(`/api/lessons/${id}`);
    return response.data;
  }

  /**
   * Get lessons by category
   */
  async getLessonsByCategory(category: string, params?: Omit<LessonQueryParams, 'category'>): Promise<PaginatedResponse<Lesson>> {
    return this.getLessons({ ...params, category });
  }

  /**
   * Get lessons by difficulty
   */
  async getLessonsByDifficulty(
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    params?: Omit<LessonQueryParams, 'difficulty'>
  ): Promise<PaginatedResponse<Lesson>> {
    return this.getLessons({ ...params, difficulty });
  }

  /**
   * Search lessons by title or content
   */
  async searchLessons(query: string, params?: Omit<LessonQueryParams, 'search'>): Promise<PaginatedResponse<Lesson>> {
    return this.getLessons({ ...params, search: query });
  }

  /**
   * Get all tracks with optional filtering
   */
  async getTracks(params?: {
    category?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    search?: string;
  }): Promise<Track[]> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get<Track[]>(`/api/tracks?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Get a specific track by ID with its lessons
   */
  async getTrackById(id: string): Promise<Track> {
    const response = await apiClient.get<Track>(`/api/tracks/${id}`);
    return response.data;
  }

  /**
   * Get lessons for a specific track
   */
  async getTrackLessons(trackId: string): Promise<Lesson[]> {
    const response = await apiClient.get<Lesson[]>(`/api/tracks/${trackId}/lessons`);
    return response.data;
  }

  /**
   * Get all available categories
   */
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>('/api/categories');
    return response.data;
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<Category> {
    const response = await apiClient.get<Category>(`/api/categories/${id}`);
    return response.data;
  }

  /**
   * Get featured lessons
   */
  async getFeaturedLessons(limit: number = 6): Promise<Lesson[]> {
    const response = await apiClient.get<Lesson[]>(`/api/lessons/featured?limit=${limit}`);
    return response.data;
  }

  /**
   * Get recommended lessons for the current user
   */
  async getRecommendedLessons(limit: number = 10): Promise<Lesson[]> {
    const response = await apiClient.get<Lesson[]>(`/api/lessons/recommended?limit=${limit}`);
    return response.data;
  }

  /**
   * Get recently added lessons
   */
  async getRecentLessons(limit: number = 10): Promise<Lesson[]> {
    const response = await apiClient.get<Lesson[]>(`/api/lessons/recent?limit=${limit}`);
    return response.data;
  }

  /**
   * Get popular lessons
   */
  async getPopularLessons(limit: number = 10): Promise<Lesson[]> {
    const response = await apiClient.get<Lesson[]>(`/api/lessons/popular?limit=${limit}`);
    return response.data;
  }

  /**
   * Get lesson prerequisites
   */
  async getLessonPrerequisites(lessonId: string): Promise<Lesson[]> {
    const response = await apiClient.get<Lesson[]>(`/api/lessons/${lessonId}/prerequisites`);
    return response.data;
  }

  /**
   * Get next lesson in a track or sequence
   */
  async getNextLesson(currentLessonId: string, trackId?: string): Promise<Lesson | null> {
    const queryParams = trackId ? `?trackId=${trackId}` : '';
    const response = await apiClient.get<Lesson | null>(
      `/api/lessons/${currentLessonId}/next${queryParams}`
    );
    return response.data;
  }

  /**
   * Get previous lesson in a track or sequence
   */
  async getPreviousLesson(currentLessonId: string, trackId?: string): Promise<Lesson | null> {
    const queryParams = trackId ? `?trackId=${trackId}` : '';
    const response = await apiClient.get<Lesson | null>(
      `/api/lessons/${currentLessonId}/previous${queryParams}`
    );
    return response.data;
  }

  /**
   * Mark lesson as started
   */
  async startLesson(lessonId: string): Promise<void> {
    await apiClient.post(`/api/lessons/${lessonId}/start`);
  }

  /**
   * Mark lesson as completed
   */
  async completeLesson(lessonId: string, timeSpent?: number): Promise<void> {
    await apiClient.post(`/api/lessons/${lessonId}/complete`, {
      timeSpent,
    });
  }

  /**
   * Update lesson progress
   */
  async updateLessonProgress(lessonId: string, progress: number): Promise<void> {
    await apiClient.patch(`/api/lessons/${lessonId}/progress`, {
      progress: Math.max(0, Math.min(100, progress)), // Ensure 0-100 range
    });
  }
}

// Export singleton instance
export const lessonsService = new LessonsService();
export default lessonsService;