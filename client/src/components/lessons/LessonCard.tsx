import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ClockIcon, 
  BookOpenIcon, 
  TagIcon,
  CheckCircleIcon,
  PlayCircleIcon 
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Lesson } from '@/types';
import { cn } from '@/utils/cn';

interface LessonCardProps {
  lesson: Lesson;
  isCompleted?: boolean;
  isInProgress?: boolean;
  progress?: number;
  className?: string;
  onStart?: (lessonId: string) => void;
  onContinue?: (lessonId: string) => void;
}

const difficultyColors = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'error',
} as const;

const difficultyLabels = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
} as const;

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  isCompleted = false,
  isInProgress = false,
  progress = 0,
  className,
  onStart,
  onContinue,
}) => {
  const handleActionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isCompleted) {
      // Navigate to lesson (handled by Link wrapper)
      return;
    }
    
    if (isInProgress && onContinue) {
      onContinue(lesson.id);
    } else if (onStart) {
      onStart(lesson.id);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <Link to={`/lessons/${lesson.id}`} className="block">
      <Card 
        hover 
        className={cn(
          'h-full transition-all duration-200 hover:scale-[1.02]',
          className
        )}
      >
        <CardContent className="p-6">
          {/* Header with status indicator */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
                {lesson.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                {lesson.description}
              </p>
            </div>
            {isCompleted && (
              <CheckCircleIcon className="h-6 w-6 text-success-600 flex-shrink-0 ml-2" />
            )}
          </div>

          {/* Progress bar for in-progress lessons */}
          {isInProgress && progress > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              <span>{formatDuration(lesson.estimatedTime)}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpenIcon className="h-4 w-4" />
              <span className="capitalize">{lesson.category}</span>
            </div>
          </div>

          {/* Tags and Difficulty */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-wrap gap-2">
              {lesson.tags.slice(0, 2).map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  size="sm"
                  icon={<TagIcon className="h-3 w-3" />}
                >
                  {tag}
                </Badge>
              ))}
              {lesson.tags.length > 2 && (
                <Badge variant="outline" size="sm">
                  +{lesson.tags.length - 2}
                </Badge>
              )}
            </div>
            <Badge 
              variant={difficultyColors[lesson.difficulty]} 
              size="sm"
            >
              {difficultyLabels[lesson.difficulty]}
            </Badge>
          </div>
        </CardContent>

        <CardFooter className="px-6 pb-6 pt-0">
          <Button
            variant={isCompleted ? 'outline' : 'primary'}
            size="sm"
            fullWidth
            leftIcon={
              isCompleted ? (
                <BookOpenIcon className="h-4 w-4" />
              ) : isInProgress ? (
                <PlayCircleIcon className="h-4 w-4" />
              ) : (
                <PlayCircleIcon className="h-4 w-4" />
              )
            }
            onClick={handleActionClick}
          >
            {isCompleted 
              ? 'Review Lesson' 
              : isInProgress 
                ? 'Continue' 
                : 'Start Lesson'
            }
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default LessonCard;