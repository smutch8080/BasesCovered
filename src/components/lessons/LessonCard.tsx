import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Lesson } from '../../types/lessons';
import { Badge } from '../../types/auth';

interface Props {
  lesson: Lesson;
  userBadges?: Badge[];
}

export const LessonCard: React.FC<Props> = ({ lesson, userBadges }) => {
  const isCompleted = userBadges?.some(badge => 
    badge.type === 'lesson' && badge.lessonId === lesson.id
  );

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <Link
      to={`/coaches-university/${lesson.id}`}
      className="group relative bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
    >
      {isCompleted && (
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
          <CheckCircle className="w-5 h-5" />
        </div>
      )}

      <span className="inline-block px-3 py-1 text-sm font-medium text-white bg-brand-gradient rounded-full mb-3">
        {lesson.category}
      </span>

      <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-brand-primary transition-colors">
        {lesson.title}
      </h3>

      <div className="text-gray-600 mb-4 line-clamp-3">
        {stripHtml(lesson.summary)}
      </div>

      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>
          {lesson.practicePlans.length} Practice Plans
        </span>
        <span>
          {new Date(lesson.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </Link>
  );
};