import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { HomeworkSubmission } from '../../types/homework';

interface Props {
  submissions: HomeworkSubmission[];
  dueDate: Date;
}

export const HomeworkProgress: React.FC<Props> = ({ submissions, dueDate }) => {
  const completed = submissions.filter(s => s.status === 'completed').length;
  const incomplete = submissions.length - completed;
  const isOverdue = new Date(dueDate) < new Date();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Completion Status</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{completed}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{incomplete}</div>
            <div className="text-sm text-gray-500">Incomplete</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full ${
            isOverdue ? 'bg-red-100' : 'bg-yellow-100'
          } flex items-center justify-center`}>
            <Clock className={`w-6 h-6 ${
              isOverdue ? 'text-red-600' : 'text-yellow-600'
            }`} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">
              {isOverdue ? 'Overdue' : 'Active'}
            </div>
            <div className="text-sm text-gray-500">
              Due {new Date(dueDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                Progress
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-green-600">
                {Math.round((completed / submissions.length) * 100)}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
            <div
              style={{ width: `${(completed / submissions.length) * 100}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};