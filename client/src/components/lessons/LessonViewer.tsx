import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  BookOpenIcon,
  CheckCircleIcon,
  PlayCircleIcon,
  PauseCircleIcon,
  TagIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useLessonViewer } from '@/hooks/useLessons';
import type { Lesson } from '@/types';
import { cn } from '@/utils/cn';

// Import highlight.js styles
import 'highlight.js/styles/github.css';

interface LessonViewerProps {
  lessonId: string;
  className?: string;
}

interface LessonProgressProps {
  lesson: Lesson;
  onStart: () => void;
  onComplete: () => void;
  onUpdateProgress: (progress: number) => void;
  isStarted?: boolean;
  isCompleted?: boolean;
  progress?: number;
}

const LessonProgress: React.FC<LessonProgressProps> = ({
  lesson,
  onStart,
  onComplete,
  onUpdateProgress,
  isStarted = false,
  isCompleted = false,
  progress = 0,
}) => {
  const [currentProgress, setCurrentProgress] = useState(progress);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setCurrentProgress(progress);
  }, [progress]);

  const handleStart = () => {
    setStartTime(new Date());
    setIsActive(true);
    onStart();
  };

  const handleComplete = () => {
    const timeSpent = startTime
      ? Math.floor((Date.now() - startTime.getTime()) / 1000 / 60)
      : 0;
    setCurrentProgress(100);
    setIsActive(false);
    onComplete();
    onUpdateProgress(100);
  };

  const handleProgressUpdate = (newProgress: number) => {
    setCurrentProgress(newProgress);
    onUpdateProgress(newProgress);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ClockIcon className="h-4 w-4" />
              <span>{formatDuration(lesson.estimatedTime)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <BookOpenIcon className="h-4 w-4" />
              <span className="capitalize">{lesson.category}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isStarted && !isCompleted && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<PlayCircleIcon className="h-4 w-4" />}
                onClick={handleStart}
              >
                Start Lesson
              </Button>
            )}

            {isStarted && !isCompleted && (
              <Button
                variant="success"
                size="sm"
                leftIcon={<CheckCircleIcon className="h-4 w-4" />}
                onClick={handleComplete}
              >
                Mark Complete
              </Button>
            )}

            {isCompleted && (
              <Badge variant="success" size="lg">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {(isStarted || isCompleted) && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(currentProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${currentProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Manual Progress Controls (for development/testing) */}
        {isStarted && !isCompleted && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Update progress:</span>
            {[25, 50, 75, 100].map(value => (
              <Button
                key={value}
                variant="ghost"
                size="sm"
                onClick={() =>
                  value === 100 ? handleComplete() : handleProgressUpdate(value)
                }
                disabled={currentProgress >= value}
              >
                {value}%
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const LessonViewer: React.FC<LessonViewerProps> = ({
  lessonId,
  className,
}) => {
  const navigate = useNavigate();
  const {
    lesson,
    track,
    loading,
    error,
    handleStartLesson,
    handleCompleteLesson,
    handleUpdateProgress,
    handleNextLesson,
    handlePreviousLesson,
  } = useLessonViewer(lessonId);

  const [nextLesson, setNextLesson] = useState<Lesson | null>(null);
  const [previousLesson, setPreviousLesson] = useState<Lesson | null>(null);

  // Load navigation lessons
  useEffect(() => {
    if (lesson) {
      handleNextLesson().then(setNextLesson);
      handlePreviousLesson().then(setPreviousLesson);
    }
  }, [lesson, handleNextLesson, handlePreviousLesson]);

  const handleNavigateNext = () => {
    if (nextLesson) {
      navigate(`/lessons/${nextLesson.id}`);
    }
  };

  const handleNavigatePrevious = () => {
    if (previousLesson) {
      navigate(`/lessons/${previousLesson.id}`);
    }
  };

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center py-12',
          className
        )}
      >
        <BookOpenIcon className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {error || 'Lesson not found'}
        </h3>
        <p className="text-gray-600 text-center mb-4">
          The lesson you&apos;re looking for doesn&apos;t exist or couldn&apos;t
          be loaded.
        </p>
        <Link to="/lessons">
          <Button variant="primary">Browse Lessons</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={cn('max-w-4xl mx-auto', className)}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/lessons">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
            >
              Back to Lessons
            </Button>
          </Link>

          {track && (
            <div className="text-sm text-gray-600">
              <Link
                to={`/tracks/${track.id}`}
                className="hover:text-primary-600"
              >
                {track.title}
              </Link>
            </div>
          )}
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {lesson.title}
        </h1>

        <p className="text-lg text-gray-600 mb-6">{lesson.description}</p>

        {/* Tags and Difficulty */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-wrap gap-2">
            {lesson.tags.map(tag => (
              <Badge
                key={tag}
                variant="outline"
                size="sm"
                icon={<TagIcon className="h-3 w-3" />}
              >
                {tag}
              </Badge>
            ))}
          </div>
          <Badge
            variant={
              lesson.difficulty === 'beginner'
                ? 'success'
                : lesson.difficulty === 'intermediate'
                  ? 'warning'
                  : 'error'
            }
          >
            {lesson.difficulty.charAt(0).toUpperCase() +
              lesson.difficulty.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Progress Section */}
      <LessonProgress
        lesson={lesson}
        onStart={handleStartLesson}
        onComplete={() => handleCompleteLesson()}
        onUpdateProgress={handleUpdateProgress}
        // TODO: Connect to actual progress data
        // isStarted={userProgress?.startedLessons.includes(lesson.id)}
        // isCompleted={userProgress?.completedLessons.includes(lesson.id)}
        // progress={userProgress?.lessonProgress[lesson.id] || 0}
      />

      {/* Prerequisites */}
      {lesson.prerequisites && lesson.prerequisites.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Prerequisites</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              {lesson.prerequisites.map((prerequisite, index) => (
                <li key={index}>{prerequisite}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Learning Outcomes */}
      {lesson.learningOutcomes && lesson.learningOutcomes.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">What You&apos;ll Learn</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              {lesson.learningOutcomes.map((outcome, index) => (
                <li key={index}>{outcome}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Lesson Content */}
      <Card className="mb-6">
        <CardContent className="p-8">
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeRaw]}
              components={{
                // Custom components for better styling
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold text-gray-900 mb-4 mt-8 first:mt-0">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-medium text-gray-900 mb-2 mt-4">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {children}
                  </p>
                ),
                code: ({ inline, className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline ? (
                    <div className="relative">
                      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-4">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    </div>
                  ) : (
                    <code
                      className="bg-gray-100 text-gray-900 px-1.5 py-0.5 rounded text-sm font-mono"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary-500 pl-4 py-2 mb-4 bg-primary-50 text-gray-700 italic">
                    {children}
                  </blockquote>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-700">
                    {children}
                  </ol>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full divide-y divide-gray-200">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {children}
                  </td>
                ),
              }}
            >
              {lesson.content}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div>
          {previousLesson && (
            <Button
              variant="outline"
              leftIcon={<ChevronLeftIcon className="h-4 w-4" />}
              onClick={handleNavigatePrevious}
            >
              <div className="text-left">
                <div className="text-xs text-gray-500">Previous</div>
                <div className="font-medium">{previousLesson.title}</div>
              </div>
            </Button>
          )}
        </div>

        <div>
          {nextLesson && (
            <Button
              variant="primary"
              rightIcon={<ChevronRightIcon className="h-4 w-4" />}
              onClick={handleNavigateNext}
            >
              <div className="text-right">
                <div className="text-xs text-primary-100">Next</div>
                <div className="font-medium">{nextLesson.title}</div>
              </div>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonViewer;
