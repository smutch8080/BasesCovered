import React from 'react';
import { Badge } from '../../types/auth';
import { LessonBadge } from '../badges/LessonBadge';

interface Props {
  badges: Badge[];
}

export const BadgesList: React.FC<Props> = ({ badges }) => {
  if (badges.length === 0) {
    return (
      <p className="text-center text-gray-500 py-4">
        No badges earned yet. Complete lessons to earn badges!
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {badges.map((badge, index) => (
        <LessonBadge
          key={`${badge.lessonId}-${index}`}
          title={badge.lessonTitle}
          date={badge.earnedAt}
        />
      ))}
    </div>
  );
};