import React from 'react';
import { Homework } from '../../types/homework';
import { HomeworkCard } from './HomeworkCard';

interface Props {
  homework: Homework[];
  playerId?: string;
}

export const HomeworkList: React.FC<Props> = ({ homework, playerId }) => {
  if (homework.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No homework assignments found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {homework.map((hw) => (
        <HomeworkCard
          key={hw.id}
          homework={hw}
          playerId={playerId}
        />
      ))}
    </div>
  );
};