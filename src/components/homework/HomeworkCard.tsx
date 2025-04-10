import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { Homework } from '../../types/homework';

interface Props {
  homework: Homework;
  playerId?: string;
}

export const HomeworkCard: React.FC<Props> = ({ homework, playerId }) => {
  const isOverdue = new Date(homework.dueDate) < new Date();
  const playerSubmission = playerId 
    ? homework.submissions.find(s => s.playerId === playerId)
    : null;

  const getStatusColor = () => {
    if (playerSubmission?.status === 'completed') return 'bg-green-50 border-l-4 border-green-500';
    if (isOverdue) return 'bg-red-50 border-l-4 border-red-500';
    return 'bg-white';
  };

  return (
    <div className={`rounded-lg shadow-md ${getStatusColor()}`}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{homework.title}</h3>
            <div className={`flex items-center gap-4 text-sm mt-2 ${
              isOverdue && !playerSubmission?.status === 'completed' ? 'text-red-600' : 'text-gray-600'
            }`}>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(homework.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{new Date(homework.dueDate).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {playerSubmission && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              playerSubmission.status === 'completed'
                ? 'bg-green-100 text-green-800'
                : isOverdue
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {playerSubmission.status === 'completed' ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Completed</span>
                </>
              ) : isOverdue ? (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  <span>Overdue</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Pending</span>
                </>
              )}
            </div>
          )}
        </div>

        {homework.description && (
          <p className="text-gray-600 mb-4">{homework.description}</p>
        )}

        {homework.drills.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">Assigned Drills:</h4>
            <div className="flex flex-wrap gap-2">
              {homework.drills.map((drill) => (
                <span
                  key={drill.id}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                >
                  {drill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {homework.attachments.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">Resources:</h4>
            <div className="space-y-2">
              {homework.attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-brand-primary hover:opacity-90"
                >
                  <FileText className="w-4 h-4" />
                  {attachment.name}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t">
          <Link
            to={`/homework/${homework.id}`}
            className={`inline-flex items-center gap-2 ${
              isOverdue && !playerSubmission?.status === 'completed'
                ? 'text-red-600 hover:text-red-700 font-medium'
                : 'text-brand-primary hover:opacity-90'
            }`}
          >
            View Details
            {isOverdue && !playerSubmission?.status === 'completed' && (
              <span className="ml-2">• Submit Now</span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};