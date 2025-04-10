import React from 'react';
import { Link } from 'react-router-dom';
import { Event } from '../../types/events';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface Props {
  date: Date;
  events: Event[];
  onEventClick?: (event: Event) => void;
}

export const WeeklyEvent: React.FC<Props> = ({ date, events, onEventClick }) => {
  if (events.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No events scheduled for {format(date, 'MMMM d, yyyy')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800">
        Events for {format(date, 'MMMM d, yyyy')}
      </h3>
      
      {events.map((event) => (
        <div
          key={event.id}
          onClick={() => onEventClick?.(event)}
          className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-medium text-gray-800">{event.title}</h4>
              {event.teamName && !event.isCommunityEvent && (
                <p className="text-brand-primary text-sm">{event.teamName}</p>
              )}
            </div>
            <span className="inline-block px-2 py-1 text-xs font-medium text-white bg-brand-gradient rounded-full">
              {event.type}
            </span>
          </div>

          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                {format(new Date(event.startDate), 'h:mm a')} - 
                {format(new Date(event.endDate), 'h:mm a')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{event.location}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};