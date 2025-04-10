import React from 'react';
import { Clock, Award, ClipboardList, MessageSquare } from 'lucide-react';
import { DashboardActivity } from '../../services/dashboard/types';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  activities: DashboardActivity[];
}

export const ActivityTimeline: React.FC<Props> = ({ activities }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'award':
        return { Icon: Award, color: 'text-yellow-500' };
      case 'practice':
        return { Icon: ClipboardList, color: 'text-blue-500' };
      case 'message':
        return { Icon: MessageSquare, color: 'text-green-500' };
      default:
        return { Icon: Clock, color: 'text-gray-500' };
    }
  };

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Recent Activity</h2>
        <p className="text-gray-500 text-center">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Recent Activity</h2>

      <div className="space-y-6">
        {activities.map((activity) => {
          const { Icon, color } = getActivityIcon(activity.type);
          
          return (
            <div key={activity.id} className="flex gap-4">
              <div className="relative">
                <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-200" />
              </div>
              
              <div className="flex-1 pb-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-800">{activity.title}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </div>
                </div>
                <p className="text-gray-600 mt-1">{activity.description}</p>
                {activity.teamName && (
                  <p className="text-sm text-brand-primary mt-1">{activity.teamName}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};