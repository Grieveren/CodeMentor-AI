import { useLessonsStore } from '@/store/lessonsStore';
import { useCallback, useEffect } from 'react';
import type { Lesson, Track, Category, LessonQueryParams } from '@/types';

/**
 * Custom hook for lesson management
 * Provides convenient access to lessons store with common operations
 */
export const useLessons = () => {
  const store = useLessonsStore();

  // Memoized selectors for better performance
  const lessons = store.lessons;
  const tracks = store.tracks;
  const categories = store.categories;
  const currentLesson = store.currentLesson;
  const currentTrack = store.currentTrack;
  const featuredLessons = store.featuredLessons;
  const recommendedLessons = store.recommendedLessons;
  const recentLessons = store.recentLessons;
  const popularLessons = store.popularLessons;
  
  const filters = store.filters;
  const pagination = store.pagination;
  const loading = store.loading;
  const errors = store.errors;

  // Memoized actions
  const fetchLessons = useCallback(
    (params?: LessonQueryParams) => store.fetchLessons(params),
    [store.fetchLessons]
  );

  const fetchLessonById = useCallback(
    (id: string) => store.fetchLessonById(id),
    [store.fetchLessonById]
  );

  const setCurrentLesson = useCallback(
    (lesson: Lesson | null) => store.setCurrentLesson(lesson),
    [store.setCurrentLesson]
  );

  const searchLessons = useCallback(
    (query: string) => store.searchLessons(query),
    [store.searchLessons]
  );

  const fetchTracks = useCallback(
    (params?: { category?: string; difficulty?: string; search?: string }) => 
      store.fetchTracks(params),
    [store.fetchTracks]
  );

  const fetchTrackById = useCallback(
    (id: string) => store.fetchTrackById(id),
    [store.fetchTrackById]
  );

  const setCurrentTrack = useCallback(
    (track: Track | null) => store.setCurrentTrack(track),
    [store.setCurrentTrack]
  );

  const fetchCategories = useCallback(
    () => store.fetchCategories(),
    [store.fetchCategories]
  );

  const setFilters = useCallback(
    (newFilters: Parameters<typeof store.setFilters>[0]) => store.setFilters(newFilters),
    [store.setFilters]
  );

  const clearFilters = useCallback(
    () => store.clearFilters(),
    [store.clearFilters]
  );

  const setPage = useCallback(
    (page: number) => store.setPage(page),
    [store.setPage]
  );

  const startLesson = useCallback(
    (lessonId: string) => store.startLesson(lessonId),
    [store.startLesson]
  );

  const completeLesson = useCallback(
    (lessonId: string, timeSpent?: number) => store.completeLesson(lessonId, timeSpent),
    [store.completeLesson]
  );

  const updateLessonProgress = useCallback(
    (lessonId: string, progress: number) => store.updateLessonProgress(lessonId, progress),
    [store.updateLessonProgress]
  );

  const getNextLesson = useCallback(
    (currentLessonId: string, trackId?: string) => store.getNextLesson(currentLessonId, trackId),
    [store.getNextLesson]
  );

  const getPreviousLesson = useCallback(
    (currentLessonId: string, trackId?: string) => store.getPreviousLesson(currentLessonId, trackId),
    [store.getPreviousLesson]
  );

  const clearError = useCallback(
    (key: Parameters<typeof store.clearError>[0]) => store.clearError(key),
    [store.clearError]
  );

  const clearAllErrors = useCallback(
    () => store.clearAllErrors(),
    [store.clearAllErrors]
  );

  // Special collections fetchers
  const fetchFeaturedLessons = useCallback(
    (limit?: number) => store.fetchFeaturedLessons(limit),
    [store.fetchFeaturedLessons]
  );

  const fetchRecommendedLessons = useCallback(
    (limit?: number) => store.fetchRecommendedLessons(limit),
    [store.fetchRecommendedLessons]
  );

  const fetchRecentLessons = useCallback(
    (limit?: number) => store.fetchRecentLessons(limit),
    [store.fetchRecentLessons]
  );

  const fetchPopularLessons = useCallback(
    (limit?: number) => store.fetchPopularLessons(limit),
    [store.fetchPopularLessons]
  );

  return {
    // State
    lessons,
    tracks,
    categories,
    currentLesson,
    currentTrack,
    featuredLessons,
    recommendedLessons,
    recentLessons,
    popularLessons,
    filters,
    pagination,
    loading,
    errors,
    
    // Actions
    fetchLessons,
    fetchLessonById,
    setCurrentLesson,
    searchLessons,
    fetchTracks,
    fetchTrackById,
    setCurrentTrack,
    fetchCategories,
    setFilters,
    clearFilters,
    setPage,
    startLesson,
    completeLesson,
    updateLessonProgress,
    getNextLesson,
    getPreviousLesson,
    clearError,
    clearAllErrors,
    fetchFeaturedLessons,
    fetchRecommendedLessons,
    fetchRecentLessons,
    fetchPopularLessons,
  };
};

/**
 * Hook for lesson browser functionality
 * Provides common operations for browsing and filtering lessons
 */
export const useLessonBrowser = () => {
  const {
    lessons,
    categories,
    filters,
    pagination,
    loading,
    errors,
    fetchLessons,
    fetchCategories,
    setFilters,
    clearFilters,
    setPage,
    searchLessons,
  } = useLessons();

  // Auto-fetch categories on mount
  useEffect(() => {
    if (categories.length === 0 && !loading.categories) {
      fetchCategories();
    }
  }, [categories.length, loading.categories, fetchCategories]);

  // Auto-fetch lessons when filters or pagination change
  useEffect(() => {
    fetchLessons();
  }, [filters, pagination.page, pagination.limit]);

  const handleFilterChange = useCallback((newFilters: Parameters<typeof setFilters>[0]) => {
    setFilters(newFilters);
  }, [setFilters]);

  const handleSearch = useCallback((query: string) => {
    searchLessons(query);
  }, [searchLessons]);

  const handlePageChange = useCallback((page: number) => {
    setPage(page);
  }, [setPage]);

  const handleClearFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  return {
    lessons,
    categories,
    filters,
    pagination,
    loading: loading.lessons || loading.categories,
    error: errors.lessons || errors.categories,
    handleFilterChange,
    handleSearch,
    handlePageChange,
    handleClearFilters,
  };
};

/**
 * Hook for lesson viewer functionality
 * Provides operations for viewing and navigating lessons
 */
export const useLessonViewer = (lessonId?: string) => {
  const {
    currentLesson,
    currentTrack,
    loading,
    errors,
    fetchLessonById,
    setCurrentLesson,
    startLesson,
    completeLesson,
    updateLessonProgress,
    getNextLesson,
    getPreviousLesson,
  } = useLessons();

  // Auto-fetch lesson when lessonId changes
  useEffect(() => {
    if (lessonId && (!currentLesson || currentLesson.id !== lessonId)) {
      fetchLessonById(lessonId);
    }
  }, [lessonId, currentLesson, fetchLessonById]);

  const handleStartLesson = useCallback(async () => {
    if (currentLesson) {
      try {
        await startLesson(currentLesson.id);
      } catch (error) {
        console.error('Failed to start lesson:', error);
      }
    }
  }, [currentLesson, startLesson]);

  const handleCompleteLesson = useCallback(async (timeSpent?: number) => {
    if (currentLesson) {
      try {
        await completeLesson(currentLesson.id, timeSpent);
      } catch (error) {
        console.error('Failed to complete lesson:', error);
      }
    }
  }, [currentLesson, completeLesson]);

  const handleUpdateProgress = useCallback(async (progress: number) => {
    if (currentLesson) {
      try {
        await updateLessonProgress(currentLesson.id, progress);
      } catch (error) {
        console.error('Failed to update lesson progress:', error);
      }
    }
  }, [currentLesson, updateLessonProgress]);

  const handleNextLesson = useCallback(async () => {
    if (currentLesson) {
      try {
        const nextLesson = await getNextLesson(
          currentLesson.id, 
          currentTrack?.id
        );
        if (nextLesson) {
          setCurrentLesson(nextLesson);
          return nextLesson;
        }
      } catch (error) {
        console.error('Failed to get next lesson:', error);
      }
    }
    return null;
  }, [currentLesson, currentTrack, getNextLesson, setCurrentLesson]);

  const handlePreviousLesson = useCallback(async () => {
    if (currentLesson) {
      try {
        const previousLesson = await getPreviousLesson(
          currentLesson.id, 
          currentTrack?.id
        );
        if (previousLesson) {
          setCurrentLesson(previousLesson);
          return previousLesson;
        }
      } catch (error) {
        console.error('Failed to get previous lesson:', error);
      }
    }
    return null;
  }, [currentLesson, currentTrack, getPreviousLesson, setCurrentLesson]);

  return {
    lesson: currentLesson,
    track: currentTrack,
    loading: loading.currentLesson,
    error: errors.currentLesson,
    handleStartLesson,
    handleCompleteLesson,
    handleUpdateProgress,
    handleNextLesson,
    handlePreviousLesson,
  };
};

/**
 * Hook for track management
 * Provides operations for working with learning tracks
 */
export const useTrack = (trackId?: string) => {
  const {
    currentTrack,
    lessons,
    loading,
    errors,
    fetchTrackById,
    fetchTrackLessons,
    setCurrentTrack,
  } = useLessons();

  // Auto-fetch track when trackId changes
  useEffect(() => {
    if (trackId && (!currentTrack || currentTrack.id !== trackId)) {
      fetchTrackById(trackId);
      fetchTrackLessons(trackId);
    }
  }, [trackId, currentTrack, fetchTrackById, fetchTrackLessons]);

  return {
    track: currentTrack,
    lessons,
    loading: loading.currentTrack || loading.lessons,
    error: errors.currentTrack || errors.lessons,
    setCurrentTrack,
  };
};

export default useLessons;