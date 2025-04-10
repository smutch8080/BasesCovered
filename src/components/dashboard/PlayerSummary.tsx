import React from 'react';
import { AlertTriangle, Calendar, TrendingUp, BookOpen, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Event } from '../../types/events';
import { Homework } from '../../types/homework';
import { ProgressReport } from '../../types/progress';

interface Props {
  events: Event[];
  homework: Homework[];
  reports: ProgressReport[];
  playerId: string;
}

export const PlayerSummary: React.FC<Props> = ({ events = [], homework = [], reports = [], playerId }) => {
  // Safely handle undefined events array
  const pendingRSVPs = (events || []).filter(event => {
    if (!event?.rsvps) return false;
    const userRSVP = event.rsvps.find(rsvp => rsvp.userId === playerId);
    return !userRSVP && new Date(event.startDate) > new Date();
  });

  // Safely handle undefined homework array
  const now = new Date();
  const homeworkStatus = (homework || []).reduce((acc, hw) => {
    const submission = hw?.submissions?.find(s => s.playerId === playerId);
    const dueDate = new Date(hw.dueDate);
    
    if (!submission || submission.status !== 'completed') {
      if (dueDate < now) {
        acc.overdue.push(hw);
      } else if (dueDate.getTime() - now.getTime() <= 48 * 60 * 60 * 1000) {
        acc.dueSoon.push(hw);
      }
    }
    return acc;
  }, { overdue: [] as Homework[], dueSoon: [] as Homework[] });

  // Safely handle undefined reports array
  const latestReport = reports?.[0];
  const averageSkillRating = latestReport ? 
    Object.values(latestReport.skills)
      .filter(skill => !skill.notApplicable && skill.value !== null)
      .reduce((sum, skill) => sum + (skill.value || 0), 0) / 
    Object.values(latestReport.skills).filter(skill => !skill.notApplicable && skill.value !== null).length
    : 0;

  // Don't render if there's nothing to show
  if (!pendingRSVPs.length && !homeworkStatus.overdue.length && !homeworkStatus.dueSoon.length && !latestReport) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Action Items</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingRSVPs.length > 0 && (
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-800 mb-2">
              <Calendar className="w-5 h-5" />
              <h3 className="font-medium">Pending RSVPs</h3>
            </div>
            <div className="space-y-2 mb-3">
              {pendingRSVPs.slice(0, 3).map(event => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="block text-sm text-yellow-700 hover:text-yellow-800"
                >
                  • {event.title} ({new Date(event.startDate).toLocaleDateString()})
                </Link>
              ))}
              {pendingRSVPs.length > 3 && (
                <p className="text-sm text-yellow-600">
                  +{pendingRSVPs.length - 3} more events need response
                </p>
              )}
            </div>
            <Link
              to="/events"
              className="text-sm text-yellow-800 hover:text-yellow-900 font-medium"
            >
              View All Events →
            </Link>
          </div>
        )}

        {(homeworkStatus.overdue.length > 0 || homeworkStatus.dueSoon.length > 0) && (
          <div className={`${homeworkStatus.overdue.length ? 'bg-red-50' : 'bg-yellow-50'} rounded-lg p-4`}>
            <div className="flex items-center gap-2 text-red-800 mb-2">
              <BookOpen className="w-5 h-5" />
              <h3 className="font-medium">Homework</h3>
            </div>
            
            {homeworkStatus.overdue.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-1 text-red-800 text-sm mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Overdue</span>
                </div>
                <div className="space-y-2">
                  {homeworkStatus.overdue.slice(0, 2).map(hw => (
                    <Link
                      key={hw.id}
                      to={`/homework/${hw.id}`}
                      className="block text-sm text-red-700 hover:text-red-800"
                    >
                      • {hw.title} (Due: {new Date(hw.dueDate).toLocaleDateString()})
                    </Link>
                  ))}
                  {homeworkStatus.overdue.length > 2 && (
                    <p className="text-sm text-red-600">
                      +{homeworkStatus.overdue.length - 2} more overdue
                    </p>
                  )}
                </div>
              </div>
            )}

            {homeworkStatus.dueSoon.length > 0 && (
              <div>
                <div className="flex items-center gap-1 text-yellow-800 text-sm mb-2">
                  <Clock className="w-4 h-4" />
                  <span>Due Soon</span>
                </div>
                <div className="space-y-2">
                  {homeworkStatus.dueSoon.slice(0, 2).map(hw => (
                    <Link
                      key={hw.id}
                      to={`/homework/${hw.id}`}
                      className="block text-sm text-yellow-700 hover:text-yellow-800"
                    >
                      • {hw.title} (Due: {new Date(hw.dueDate).toLocaleDateString()})
                    </Link>
                  ))}
                  {homeworkStatus.dueSoon.length > 2 && (
                    <p className="text-sm text-yellow-600">
                      +{homeworkStatus.dueSoon.length - 2} more due soon
                    </p>
                  )}
                </div>
              </div>
            )}

            <Link
              to="/homework"
              className="text-sm text-red-800 hover:text-red-900 font-medium mt-3 inline-block"
            >
              Complete Homework →
            </Link>
          </div>
        )}

        {latestReport && (
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-800 mb-2">
              <TrendingUp className="w-5 h-5" />
              <h3 className="font-medium">Latest Progress</h3>
            </div>
            <p className="text-blue-700 mb-3">
              Average Skill Rating: {averageSkillRating.toFixed(1)}/10
            </p>
            <Link
              to="/progress"
              className="text-sm text-blue-800 hover:text-blue-900 font-medium"
            >
              View Full Report →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};