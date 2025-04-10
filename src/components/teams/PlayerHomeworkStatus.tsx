import React from 'react';
import { BookOpen, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Homework } from '../../types/homework';

interface Props {
  homework: Homework[];
  playerId: string;
}

export const PlayerHomeworkStatus: React.FC<Props> = ({ homework, playerId }) => {
  const playerHomework = homework.filter(hw => 
    !hw.playerId || hw.playerId === playerId
  );

  if (playerHomework.length === 0) return null;

  const getStatus = (hw: Homework) => {
    const submission = hw.submissions.find(s => s.playerId === playerId);
    if (!submission) {
      return new Date(hw.dueDate) < new Date() ? 'overdue' : 'pending';
    }
    return submission.status;
  };

  const stats = playerHomework.reduce((acc, hw) => {
    const status = getStatus(hw);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex items-center gap-3">
      {stats.completed && (
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span>{stats.completed}</span>
        </div>
      )}
      {stats.pending && (
        <div className="flex items-center gap-1 text-yellow-600">
          <Clock className="w-4 h-4" />
          <span>{stats.pending}</span>
        </div>
      )}
      {stats.overdue && (
        <div className="flex items-center gap-1 text-red-600">
          <XCircle className="w-4 h-4" />
          <span>{stats.overdue}</span>
        </div>
      )}
      <BookOpen className="w-4 h-4 text-gray-400" />
    </div>
  );
};