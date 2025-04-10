import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, ChevronRight, Users, Calendar } from 'lucide-react';
import { DashboardSession } from '../../services/dashboard/types';
import { formatTime } from '../../utils/dateUtils';

interface Props {
  sessions: DashboardSession[];
}

export const ScheduleWidget: React.FC<Props> = ({ sessions }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get start of week (Sunday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  // Get end of week (Saturday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // Filter sessions for current week and sort by date
  const weekSessions = sessions
    .filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= startOfWeek && sessionDate <= endOfWeek;
    })
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  // Group sessions by day
  const sessionsByDay = weekSessions.reduce((acc, session) => {
    const dateKey = session.startTime.toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(session);
    return acc;
  }, {} as Record<string, DashboardSession[]>);

  const getDayLabel = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const getRSVPStatus = (session: DashboardSession) => {
    if (!session.rsvps?.length) return null;
    const going = session.rsvps.filter(rsvp => rsvp.status === 'going').length;
    return `${going} ${going === 1 ? 'person' : 'people'} attending`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-brand-primary" />
          <h2 className="text-lg font-semibold text-gray-800">This Week's Schedule</h2>
        </div>
        <Link
          to="/events"
          className="text-brand-primary hover:opacity-90 flex items-center gap-1 text-sm"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {Object.keys(sessionsByDay).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(sessionsByDay).map(([dateKey, dayEvents]) => (
            <div key={dateKey} className="space-y-3">
              <h3 className="font-medium text-gray-700">
                {getDayLabel(new Date(dateKey))}
              </h3>
              <div className="space-y-3">
                {dayEvents.map((event) => (
                  <Link
                    key={event.id}
                    to={`/events/${event.id}`}
                    className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-800">{event.title}</h4>
                        {event.teamName && (
                          <p className="text-sm text-brand-primary">{event.teamName}</p>
                        )}
                      </div>
                      <span className="inline-block px-2 py-1 text-xs font-medium text-white bg-brand-gradient rounded-full">
                        {event.type}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          {formatTime(event.startTime)} - {formatTime(event.endTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                      {event.description && (
                        <p className="text-gray-600 line-clamp-2 mt-2">{event.description}</p>
                      )}
                      {getRSVPStatus(event) && (
                        <div className="flex items-center gap-2 mt-2">
                          <Users className="w-4 h-4" />
                          <span className="text-gray-500">{getRSVPStatus(event)}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No events scheduled this week</p>
        </div>
      )}
    </div>
  );
};