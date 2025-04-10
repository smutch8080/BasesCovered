import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Event, RSVPStatus } from '../../types/events';
import { formatDate, formatTime } from '../../utils/dateUtils';

interface Props {
  event: Event;
  userRSVP?: RSVPStatus;
  onRSVP?: (status: RSVPStatus) => void;
}

export const EventCard: React.FC<Props> = ({ event, userRSVP, onRSVP }) => {
  const goingCount = event.rsvps.filter(rsvp => rsvp.status === RSVPStatus.Going).length;
  const maybeCount = event.rsvps.filter(rsvp => rsvp.status === RSVPStatus.Maybe).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="inline-block px-3 py-1 text-sm font-medium text-white bg-brand-gradient rounded-full mb-2">
              {event.type}
            </span>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{event.title}</h3>
            {event.teamName && !event.isCommunityEvent && (
              <p className="text-brand-primary">{event.teamName}</p>
            )}
            {event.type === 'Game' && event.opponent && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {event.isHomeTeam ? 'vs' : '@ '}{event.opponent}
              </p>
            )}
          </div>
          {event.cost && (
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              ${event.cost}
            </span>
          )}
        </div>

        <div className="space-y-2 text-gray-600 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(event.startDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{formatTime(event.startDate)} - {formatTime(event.endDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{goingCount} going • {maybeCount} maybe</span>
          </div>
        </div>

        {event.description && (
          <p className="text-gray-600 dark:text-gray-400 mb-4">{event.description}</p>
        )}

        <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
          <Link
            to={`/events/${event.id}`}
            className="text-brand-primary hover:opacity-90"
          >
            View Details
          </Link>

          {onRSVP && (
            <div className="flex gap-2">
              <button
                onClick={() => onRSVP(RSVPStatus.Going)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  userRSVP === RSVPStatus.Going
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                Going
              </button>
              <button
                onClick={() => onRSVP(RSVPStatus.Maybe)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  userRSVP === RSVPStatus.Maybe
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                Maybe
              </button>
              <button
                onClick={() => onRSVP(RSVPStatus.NotGoing)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  userRSVP === RSVPStatus.NotGoing
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                Not Going
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};