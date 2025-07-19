import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LessonBrowser } from '@/components/lessons/LessonBrowser';
import { useLessons } from '@/hooks/useLessons';

export const LessonsPage: React.FC = () => {
  const navigate = useNavigate();
  const { startLesson } = useLessons();

  const handleLessonStart = async (lessonId: string) => {
    try {
      await startLesson(lessonId);
      navigate(`/lessons/${lessonId}`);
    } catch (error) {
      console.error('Failed to start lesson:', error);
      // Still navigate to the lesson even if tracking fails
      navigate(`/lessons/${lessonId}`);
    }
  };

  const handleLessonContinue = (lessonId: string) => {
    navigate(`/lessons/${lessonId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Browse Lessons
        </h1>
        <p className="text-lg text-gray-600">
          Discover coding lessons tailored to your learning journey
        </p>
      </div>

      <LessonBrowser
        onLessonStart={handleLessonStart}
        onLessonContinue={handleLessonContinue}
      />
    </div>
  );
};

export default LessonsPage;