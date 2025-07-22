import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { lessonsService } from '@/services/lessonsService';
import type {
  Lesson,
  Track,
  Category,
  LessonQueryParams,
  PaginatedResponse,
} from '@/types';
import type { LessonFilters as ServiceLessonFilters } from '@/services/lessonsService';

// Extended lesson filters for the store
export interface LessonStoreFilters extends ServiceLessonFilters {
  showCompleted?: boolean;
  showInProgress?: boolean;
}

// Pagination state
export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Loading states for different operations
export interface LessonsLoadingState {
  lessons: boolean;
  tracks: boolean;
  categories: boolean;
  currentLesson: boolean;
  currentTrack: boolean;
  featured: boolean;
  recommended: boolean;
  recent: boolean;
  popular: boolean;
}

// Error states for different operations
export interface LessonsErrorState {
  lessons: string | null;
  tracks: string | null;
  categories: string | null;
  currentLesson: string | null;
  currentTrack: string | null;
  featured: string | null;
  recommended: string | null;
  recent: string | null;
  popular: string | null;
}

// Lessons store state and actions
interface LessonsStore {
  // State
  lessons: Lesson[];
  tracks: Track[];
  categories: Category[];
  currentLesson: Lesson | null;
  currentTrack: Track | null;
  featuredLessons: Lesson[];
  recommendedLessons: Lesson[];
  recentLessons: Lesson[];
  popularLessons: Lesson[];

  // Filters and pagination
  filters: LessonStoreFilters;
  pagination: PaginationState;

  // Loading and error states
  loading: LessonsLoadingState;
  errors: LessonsErrorState;

  // Actions - Lesson management
  fetchLessons: (params?: LessonQueryParams) => Promise<void>;
  fetchLessonById: (id: string) => Promise<void>;
  setCurrentLesson: (lesson: Lesson | null) => void;
  searchLessons: (query: string) => Promise<void>;

  // Actions - Track management
  fetchTracks: (params?: {
    category?: string;
    difficulty?: string;
    search?: string;
  }) => Promise<void>;
  fetchTrackById: (id: string) => Promise<void>;
  setCurrentTrack: (track: Track | null) => void;
  fetchTrackLessons: (trackId: string) => Promise<void>;

  // Actions - Category management
  fetchCategories: () => Promise<void>;

  // Actions - Special lesson collections
  fetchFeaturedLessons: (limit?: number) => Promise<void>;
  fetchRecommendedLessons: (limit?: number) => Promise<void>;
  fetchRecentLessons: (limit?: number) => Promise<void>;
  fetchPopularLessons: (limit?: number) => Promise<void>;

  // Actions - Filters and pagination
  setFilters: (filters: Partial<LessonStoreFilters>) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;

  // Actions - Progress tracking
  startLesson: (lessonId: string) => Promise<void>;
  completeLesson: (lessonId: string, timeSpent?: number) => Promise<void>;
  updateLessonProgress: (lessonId: string, progress: number) => Promise<void>;

  // Actions - Navigation
  getNextLesson: (
    currentLessonId: string,
    trackId?: string
  ) => Promise<Lesson | null>;
  getPreviousLesson: (
    currentLessonId: string,
    trackId?: string
  ) => Promise<Lesson | null>;

  // Actions - Error handling
  clearError: (key: keyof LessonsErrorState) => void;
  clearAllErrors: () => void;

  // Internal actions
  setLoading: (key: keyof LessonsLoadingState, loading: boolean) => void;
  setError: (key: keyof LessonsErrorState, error: string | null) => void;
}

// Initial states
const initialLoadingState: LessonsLoadingState = {
  lessons: false,
  tracks: false,
  categories: false,
  currentLesson: false,
  currentTrack: false,
  featured: false,
  recommended: false,
  recent: false,
  popular: false,
};

const initialErrorState: LessonsErrorState = {
  lessons: null,
  tracks: null,
  categories: null,
  currentLesson: null,
  currentTrack: null,
  featured: null,
  recommended: null,
  recent: null,
  popular: null,
};

const initialPaginationState: PaginationState = {
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
};

const initialFilters: LessonStoreFilters = {};

// Create the lessons store with persistence for filters and current selections
export const useLessonsStore = create<LessonsStore>()(
  persist(
    (set, get) => ({
      // Initial state
      lessons: [],
      tracks: [],
      categories: [],
      currentLesson: null,
      currentTrack: null,
      featuredLessons: [],
      recommendedLessons: [],
      recentLessons: [],
      popularLessons: [],

      filters: initialFilters,
      pagination: initialPaginationState,
      loading: initialLoadingState,
      errors: initialErrorState,

      // Lesson management actions
      fetchLessons: async (params?: LessonQueryParams) => {
        const { setLoading, setError } = get();
        setLoading('lessons', true);
        setError('lessons', null);

        try {
          const queryParams = {
            ...get().filters,
            page: get().pagination.page,
            limit: get().pagination.limit,
            ...params,
          };

          const response: PaginatedResponse<Lesson> =
            await lessonsService.getLessons(queryParams);

          set({
            lessons: response.data,
            pagination: {
              page: response.pagination.page,
              limit: response.pagination.limit,
              total: response.pagination.total,
              totalPages: response.pagination.totalPages,
              hasNext: response.pagination.hasNext,
              hasPrev: response.pagination.hasPrev,
            },
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to fetch lessons';
          setError('lessons', errorMessage);
          console.error('Error fetching lessons:', error);
        } finally {
          setLoading('lessons', false);
        }
      },

      fetchLessonById: async (id: string) => {
        const { setLoading, setError } = get();
        setLoading('currentLesson', true);
        setError('currentLesson', null);

        try {
          const lesson = await lessonsService.getLessonById(id);
          set({ currentLesson: lesson });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to fetch lesson';
          setError('currentLesson', errorMessage);
          console.error('Error fetching lesson:', error);
        } finally {
          setLoading('currentLesson', false);
        }
      },

      setCurrentLesson: (lesson: Lesson | null) => {
        set({ currentLesson: lesson });
      },

      searchLessons: async (query: string) => {
        const { fetchLessons } = get();
        await fetchLessons({ search: query, page: 1 });
      },

      // Track management actions
      fetchTracks: async params => {
        const { setLoading, setError } = get();
        setLoading('tracks', true);
        setError('tracks', null);

        try {
          const tracks = await lessonsService.getTracks(params);
          set({ tracks });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to fetch tracks';
          setError('tracks', errorMessage);
          console.error('Error fetching tracks:', error);
        } finally {
          setLoading('tracks', false);
        }
      },

      fetchTrackById: async (id: string) => {
        const { setLoading, setError } = get();
        setLoading('currentTrack', true);
        setError('currentTrack', null);

        try {
          const track = await lessonsService.getTrackById(id);
          set({ currentTrack: track });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to fetch track';
          setError('currentTrack', errorMessage);
          console.error('Error fetching track:', error);
        } finally {
          setLoading('currentTrack', false);
        }
      },

      setCurrentTrack: (track: Track | null) => {
        set({ currentTrack: track });
      },

      fetchTrackLessons: async (trackId: string) => {
        const { setLoading, setError } = get();
        setLoading('lessons', true);
        setError('lessons', null);

        try {
          const lessons = await lessonsService.getTrackLessons(trackId);
          set({ lessons });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to fetch track lessons';
          setError('lessons', errorMessage);
          console.error('Error fetching track lessons:', error);
        } finally {
          setLoading('lessons', false);
        }
      },

      // Category management actions
      fetchCategories: async () => {
        const { setLoading, setError } = get();
        setLoading('categories', true);
        setError('categories', null);

        try {
          const categories = await lessonsService.getCategories();
          set({ categories });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to fetch categories';
          setError('categories', errorMessage);
          console.error('Error fetching categories:', error);
        } finally {
          setLoading('categories', false);
        }
      },

      // Special lesson collections
      fetchFeaturedLessons: async (limit = 6) => {
        const { setLoading, setError } = get();
        setLoading('featured', true);
        setError('featured', null);

        try {
          const featuredLessons =
            await lessonsService.getFeaturedLessons(limit);
          set({ featuredLessons });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to fetch featured lessons';
          setError('featured', errorMessage);
          console.error('Error fetching featured lessons:', error);
        } finally {
          setLoading('featured', false);
        }
      },

      fetchRecommendedLessons: async (limit = 10) => {
        const { setLoading, setError } = get();
        setLoading('recommended', true);
        setError('recommended', null);

        try {
          const recommendedLessons =
            await lessonsService.getRecommendedLessons(limit);
          set({ recommendedLessons });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to fetch recommended lessons';
          setError('recommended', errorMessage);
          console.error('Error fetching recommended lessons:', error);
        } finally {
          setLoading('recommended', false);
        }
      },

      fetchRecentLessons: async (limit = 10) => {
        const { setLoading, setError } = get();
        setLoading('recent', true);
        setError('recent', null);

        try {
          const recentLessons = await lessonsService.getRecentLessons(limit);
          set({ recentLessons });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to fetch recent lessons';
          setError('recent', errorMessage);
          console.error('Error fetching recent lessons:', error);
        } finally {
          setLoading('recent', false);
        }
      },

      fetchPopularLessons: async (limit = 10) => {
        const { setLoading, setError } = get();
        setLoading('popular', true);
        setError('popular', null);

        try {
          const popularLessons = await lessonsService.getPopularLessons(limit);
          set({ popularLessons });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to fetch popular lessons';
          setError('popular', errorMessage);
          console.error('Error fetching popular lessons:', error);
        } finally {
          setLoading('popular', false);
        }
      },

      // Filter and pagination actions
      setFilters: (newFilters: Partial<LessonStoreFilters>) => {
        set(state => ({
          filters: { ...state.filters, ...newFilters },
          pagination: { ...state.pagination, page: 1 }, // Reset to first page when filters change
        }));
      },

      clearFilters: () => {
        set({
          filters: initialFilters,
          pagination: { ...get().pagination, page: 1 },
        });
      },

      setPage: (page: number) => {
        set(state => ({
          pagination: { ...state.pagination, page },
        }));
      },

      // Progress tracking actions
      startLesson: async (lessonId: string) => {
        try {
          await lessonsService.startLesson(lessonId);
          // Optionally refresh current lesson or lessons list
        } catch (error) {
          console.error('Error starting lesson:', error);
          throw error;
        }
      },

      completeLesson: async (lessonId: string, timeSpent?: number) => {
        try {
          await lessonsService.completeLesson(lessonId, timeSpent);
          // Optionally refresh current lesson or lessons list
        } catch (error) {
          console.error('Error completing lesson:', error);
          throw error;
        }
      },

      updateLessonProgress: async (lessonId: string, progress: number) => {
        try {
          await lessonsService.updateLessonProgress(lessonId, progress);
          // Optionally update local state
        } catch (error) {
          console.error('Error updating lesson progress:', error);
          throw error;
        }
      },

      // Navigation actions
      getNextLesson: async (currentLessonId: string, trackId?: string) => {
        try {
          return await lessonsService.getNextLesson(currentLessonId, trackId);
        } catch (error) {
          console.error('Error getting next lesson:', error);
          return null;
        }
      },

      getPreviousLesson: async (currentLessonId: string, trackId?: string) => {
        try {
          return await lessonsService.getPreviousLesson(
            currentLessonId,
            trackId
          );
        } catch (error) {
          console.error('Error getting previous lesson:', error);
          return null;
        }
      },

      // Error handling actions
      clearError: (key: keyof LessonsErrorState) => {
        set(state => ({
          errors: { ...state.errors, [key]: null },
        }));
      },

      clearAllErrors: () => {
        set({ errors: initialErrorState });
      },

      // Internal actions
      setLoading: (key: keyof LessonsLoadingState, loading: boolean) => {
        set(state => ({
          loading: { ...state.loading, [key]: loading },
        }));
      },

      setError: (key: keyof LessonsErrorState, error: string | null) => {
        set(state => ({
          errors: { ...state.errors, [key]: error },
        }));
      },
    }),
    {
      name: 'lessons-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist filters, current selections, and pagination
      partialize: state => ({
        filters: state.filters,
        currentLesson: state.currentLesson,
        currentTrack: state.currentTrack,
        pagination: {
          page: state.pagination.page,
          limit: state.pagination.limit,
        },
      }),
    }
  )
);
