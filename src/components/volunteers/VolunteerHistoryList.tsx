import React from 'react';
import { VolunteerHistory } from '../../types/volunteer';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Props {
  history: VolunteerHistory[];
}

export const VolunteerHistoryList: React.FC<Props> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No volunteer history yet
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'no_show':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {history.map((record) => (
        <div
          key={record.id}
          className="bg-white rounded-lg shadow-sm border p-4"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-800">{record.roleName}</h3>
              <p className="text-brand-primary">{record.eventName}</p>
              
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{record.date.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{record.hoursServed} hours</span>
                </div>
              </div>

              {record.feedback && (
                <p className="mt-2 text-sm text-gray-600 italic">
                  "{record.feedback}"
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {getStatusIcon(record.status)}
              <span className={`text-sm font-medium ${
                record.status === 'completed' ? 'text-green-600' :
                record.status === 'no_show' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {record.status.replace('_', ' ').charAt(0).toUpperCase() + 
                 record.status.slice(1).replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};