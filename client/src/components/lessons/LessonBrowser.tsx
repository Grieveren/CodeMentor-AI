import React from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { LessonCard } from './LessonCard';
import { LessonFilters } from './LessonFilters';
import { useLessonBrowser } from '@/hooks/useLessons';
import { cn } from '@/utils/cn';

interface LessonBrowserProps {
  className?: string;
  onLessonStart?: (lessonId: string) => void;
  onLessonContinue?: (lessonId: string) => void;
}

export const LessonBrowser: React.FC<LessonBrowserProps> = ({
  className,
  onLessonStart,
  onLessonContinue,
}) => {
  const {
    lessons,
    categories,
    filters,
    pagination,
    loading,
    error,
    handleFilterChange,
    handleSearch,
    handlePageChange,
    handleClearFilters,
  } = useLessonBrowser();

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const { page, totalPages } = pagination;

    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (error) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center py-12',
          className
        )}
      >
        <ExclamationTriangleIcon className="h-12 w-12 text-error-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Failed to load lessons
        </h3>
        <p className="text-gray-600 text-center mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Filters */}
      <LessonFilters
        filters={filters}
        categories={categories}
        onFiltersChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpenIcon className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-600">
            {loading
              ? 'Loading lessons...'
              : `${pagination.total} lesson${pagination.total !== 1 ? 's' : ''} found`}
          </span>
        </div>

        {pagination.totalPages > 1 && (
          <div className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {/* Empty State */}
      {!loading && lessons.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <BookOpenIcon className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No lessons found
          </h3>
          <p className="text-gray-600 text-center mb-4">
            Try adjusting your filters or search terms to find more lessons.
          </p>
          {Object.keys(filters).length > 0 && (
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Lessons Grid */}
      {!loading && lessons.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {lessons.map(lesson => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onStart={onLessonStart}
                onContinue={onLessonContinue}
                // TODO: Add progress tracking integration
                // isCompleted={userProgress?.completedLessons.includes(lesson.id)}
                // isInProgress={userProgress?.inProgressLessons.includes(lesson.id)}
                // progress={userProgress?.lessonProgress[lesson.id]}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-8">
              {/* Previous Button */}
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrev}
                onClick={() => handlePageChange(pagination.page - 1)}
                leftIcon={<ChevronLeftIcon className="h-4 w-4" />}
              >
                Previous
              </Button>

              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {/* First page if not visible */}
                {pageNumbers[0] > 1 && (
                  <>
                    <Button
                      variant={1 === pagination.page ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => handlePageChange(1)}
                    >
                      1
                    </Button>
                    {pageNumbers[0] > 2 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}
                  </>
                )}

                {/* Visible page numbers */}
                {pageNumbers.map(pageNum => (
                  <Button
                    key={pageNum}
                    variant={pageNum === pagination.page ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                ))}

                {/* Last page if not visible */}
                {pageNumbers[pageNumbers.length - 1] <
                  pagination.totalPages && (
                  <>
                    {pageNumbers[pageNumbers.length - 1] <
                      pagination.totalPages - 1 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}
                    <Button
                      variant={
                        pagination.totalPages === pagination.page
                          ? 'primary'
                          : 'ghost'
                      }
                      size="sm"
                      onClick={() => handlePageChange(pagination.totalPages)}
                    >
                      {pagination.totalPages}
                    </Button>
                  </>
                )}
              </div>

              {/* Next Button */}
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNext}
                onClick={() => handlePageChange(pagination.page + 1)}
                rightIcon={<ChevronRightIcon className="h-4 w-4" />}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LessonBrowser;
