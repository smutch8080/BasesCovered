import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Homework } from '../../types/homework';

interface Props {
  teamId: string;
  playerId: string;
  homework: Homework[];
  isCoach?: boolean;
}

export const PlayerHomework: React.FC<Props> = ({ teamId, playerId, homework, isCoach }) => {
  // Filter homework for this player (individual + team assignments)
  const playerHomework = homework.filter(hw => 
    !hw.playerId || hw.playerId === playerId
  );

  const getSubmissionStatus = (hw: Homework) => {
    const submission = hw.submissions.find(s => s.playerId === playerId);
    if (!submission) {
      return new Date(hw.dueDate) < new Date() ? 'overdue' : 'pending';
    }
    return submission.status;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-brand-primary" />
          <h2 className="text-xl font-semibold text-gray-800">Homework</h2>
        </div>
        {isCoach && (
          <Link
            to="/homework/new"
            state={{ teamId, playerId }}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
              hover:opacity-90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Assign Homework
          </Link>
        )}
      </div>

      {playerHomework.length > 0 ? (
        <div className="space-y-4">
          {playerHomework.map((hw) => {
            const status = getSubmissionStatus(hw);
            const isOverdue = status === 'overdue';
            const isCompleted = status === 'completed';

            return (
              <Link
                key={hw.id}
                to={`/homework/${hw.id}`}
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-800">{hw.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className={`flex items-center gap-1 ${
                        isCompleted ? 'text-green-600' :
                        isOverdue ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {isCompleted ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>Completed</span>
                          </>
                        ) : isOverdue ? (
                          <>
                            <XCircle className="w-4 h-4" />
                            <span>Overdue</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4" />
                            <span>Pending</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-4">
          No homework assignments
        </p>
      )}
    </div>
  );
};