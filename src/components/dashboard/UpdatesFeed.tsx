import React, { useEffect, useState } from 'react';
import { AlertCircle, TrendingUp, Award, ClipboardList, BookOpen, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardActivity } from '../../services/dashboard/types';
import { fetchActivities } from '../../services/dashboard/activities';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export const UpdatesFeed: React.FC = () => {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState<DashboardActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadActivities = async () => {
      if (!currentUser?.teams?.length) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const loadedActivities = await fetchActivities(currentUser.teams);
        setActivities(loadedActivities);
      } catch (error) {
        console.error('Error loading activities:', error);
        setError('Unable to load updates');
        toast.error('Unable to load updates');
      } finally {
        setIsLoading(false);
      }
    };

    loadActivities();
  }, [currentUser]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'award':
        return <Award className="w-5 h-5 text-yellow-500" />;
      case 'practice':
        return <ClipboardList className="w-5 h-5 text-blue-500" />;
      case 'homework_assigned':
        return <BookOpen className="w-5 h-5 text-purple-500" />;
      case 'homework_completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Priority Updates</h2>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Priority Updates</h2>
        <div className="text-center text-red-600 py-4">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Priority Updates</h2>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brand-primary" />
          <span className="text-sm text-gray-600">{activities.length} updates</span>
        </div>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            {getActivityIcon(activity.type)}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <p className="font-medium text-gray-800">{activity.title}</p>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-gray-600">{activity.description}</p>
              {activity.teamName && (
                <p className="text-xs text-brand-primary mt-1">{activity.teamName}</p>
              )}
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <p className="text-center text-gray-500 py-4">No recent updates</p>
        )}
      </div>
    </div>
  );
};