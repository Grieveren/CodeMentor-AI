import React from 'react';
import { useParams } from 'react-router-dom';
import { LessonViewer } from '@/components/lessons/LessonViewer';

export const LessonPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();

  if (!lessonId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Lesson Not Found
          </h1>
          <p className="text-gray-600">
            The lesson you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <LessonViewer lessonId={lessonId} />
    </div>
  );
};

export default LessonPage;
