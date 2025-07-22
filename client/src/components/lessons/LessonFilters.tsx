import React, { useState } from 'react';
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Category } from '@/types';
import type { LessonStoreFilters } from '@/store/lessonsStore';
import { cn } from '@/utils/cn';

interface LessonFiltersProps {
  filters: LessonStoreFilters;
  categories: Category[];
  onFiltersChange: (filters: Partial<LessonStoreFilters>) => void;
  onClearFilters: () => void;
  className?: string;
}

const difficultyOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
] as const;

const sortOptions = [
  { value: 'title', label: 'Title' },
  { value: 'difficulty', label: 'Difficulty' },
  { value: 'createdAt', label: 'Date Added' },
  { value: 'estimatedTime', label: 'Duration' },
] as const;

const sortOrderOptions = [
  { value: 'asc', label: 'Ascending' },
  { value: 'desc', label: 'Descending' },
] as const;

export const LessonFilters: React.FC<LessonFiltersProps> = ({
  filters,
  categories,
  onFiltersChange,
  onClearFilters,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.search || '');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ search: searchQuery.trim() || undefined });
  };

  const handleCategoryChange = (categoryId: string) => {
    onFiltersChange({
      category: filters.category === categoryId ? undefined : categoryId,
    });
  };

  const handleDifficultyChange = (
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ) => {
    onFiltersChange({
      difficulty: filters.difficulty === difficulty ? undefined : difficulty,
    });
  };

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({ sortBy: sortBy as any });
  };

  const handleSortOrderChange = (sortOrder: 'asc' | 'desc') => {
    onFiltersChange({ sortOrder });
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];

    onFiltersChange({
      tags: newTags.length > 0 ? newTags : undefined,
    });
  };

  const handleProgressFilterChange = (type: 'completed' | 'inProgress') => {
    if (type === 'completed') {
      onFiltersChange({
        showCompleted: !filters.showCompleted,
        showInProgress: filters.showCompleted ? filters.showInProgress : false,
      });
    } else {
      onFiltersChange({
        showInProgress: !filters.showInProgress,
        showCompleted: filters.showInProgress ? filters.showCompleted : false,
      });
    }
  };

  const hasActiveFilters = Boolean(
    filters.category ||
      filters.difficulty ||
      filters.search ||
      (filters.tags && filters.tags.length > 0) ||
      filters.showCompleted ||
      filters.showInProgress
  );

  return (
    <div
      className={cn(
        'bg-white border border-gray-200 rounded-lg p-4',
        className
      )}
    >
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="mb-4">
        <Input
          type="text"
          placeholder="Search lessons..."
          value={searchQuery}
          onChange={handleSearchChange}
          leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
          rightIcon={
            searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  onFiltersChange({ search: undefined });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )
          }
        />
      </form>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<AdjustmentsHorizontalIcon className="h-4 w-4" />}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          Filters
          {hasActiveFilters && (
            <Badge variant="primary" size="sm" className="ml-2">
              {[
                filters.category && 1,
                filters.difficulty && 1,
                filters.tags?.length || 0,
                filters.showCompleted && 1,
                filters.showInProgress && 1,
              ]
                .filter(Boolean)
                .reduce((a, b) => (a as number) + (b as number), 0)}
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<XMarkIcon className="h-4 w-4" />}
            onClick={onClearFilters}
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="space-y-6 border-t border-gray-200 pt-4">
          {/* Categories */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Category</h4>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={
                    filters.category === category.id ? 'primary' : 'outline'
                  }
                  size="sm"
                  onClick={() => handleCategoryChange(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Difficulty
            </h4>
            <div className="flex flex-wrap gap-2">
              {difficultyOptions.map(option => (
                <Button
                  key={option.value}
                  variant={
                    filters.difficulty === option.value ? 'primary' : 'outline'
                  }
                  size="sm"
                  onClick={() => handleDifficultyChange(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Progress Status */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Progress Status
            </h4>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filters.showCompleted ? 'success' : 'outline'}
                size="sm"
                onClick={() => handleProgressFilterChange('completed')}
              >
                Completed
              </Button>
              <Button
                variant={filters.showInProgress ? 'warning' : 'outline'}
                size="sm"
                onClick={() => handleProgressFilterChange('inProgress')}
              >
                In Progress
              </Button>
            </div>
          </div>

          {/* Sort Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Sort By
              </h4>
              <div className="flex flex-wrap gap-2">
                {sortOptions.map(option => (
                  <Button
                    key={option.value}
                    variant={
                      filters.sortBy === option.value ? 'primary' : 'outline'
                    }
                    size="sm"
                    onClick={() => handleSortChange(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Order</h4>
              <div className="flex flex-wrap gap-2">
                {sortOrderOptions.map(option => (
                  <Button
                    key={option.value}
                    variant={
                      filters.sortOrder === option.value ? 'primary' : 'outline'
                    }
                    size="sm"
                    onClick={() => handleSortOrderChange(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.category && (
              <Badge
                variant="primary"
                className="cursor-pointer"
                onClick={() => onFiltersChange({ category: undefined })}
              >
                Category:{' '}
                {categories.find(c => c.id === filters.category)?.name}
                <XMarkIcon className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {filters.difficulty && (
              <Badge
                variant="primary"
                className="cursor-pointer"
                onClick={() => onFiltersChange({ difficulty: undefined })}
              >
                {
                  difficultyOptions.find(d => d.value === filters.difficulty)
                    ?.label
                }
                <XMarkIcon className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {filters.showCompleted && (
              <Badge
                variant="success"
                className="cursor-pointer"
                onClick={() => onFiltersChange({ showCompleted: false })}
              >
                Completed
                <XMarkIcon className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {filters.showInProgress && (
              <Badge
                variant="warning"
                className="cursor-pointer"
                onClick={() => onFiltersChange({ showInProgress: false })}
              >
                In Progress
                <XMarkIcon className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {filters.tags?.map(tag => (
              <Badge
                key={tag}
                variant="outline"
                className="cursor-pointer"
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
                <XMarkIcon className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonFilters;
