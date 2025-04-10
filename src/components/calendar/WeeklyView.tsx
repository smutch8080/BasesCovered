import React from 'react';
import { format, startOfWeek, addDays, isSameDay, isToday } from 'date-fns';
import { Event } from '../../types/events';
import { EventList } from './EventList';
import { getEventsByDate } from '../../utils/calendarUtils';

interface Props {
  events: Event[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onEventClick?: (event: Event) => void;
}

export const WeeklyView: React.FC<Props> = ({
  events,
  selectedDate,
  onDateSelect,
  onEventClick
}) => {
  const startDate = startOfWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((date) => {
          const dayEvents = getEventsByDate(events, date);
          const isSelected = isSameDay(date, selectedDate);
          const isCurrentDay = isToday(date);

          return (
            <button
              key={date.toString()}
              onClick={() => onDateSelect(date)}
              className={`flex flex-col items-center p-3 rounded-lg transition-colors
                ${isSelected 
                  ? 'bg-brand-primary text-white' 
                  : isCurrentDay
                  ? 'bg-brand-primary/10'
                  : 'hover:bg-gray-50'}`}
            >
              <span className="text-sm font-medium">
                {format(date, 'EEE')}
              </span>
              <span className="text-2xl font-bold mt-1">
                {format(date, 'd')}
              </span>
              {dayEvents.length > 0 && (
                <div className="mt-2 w-2 h-2 rounded-full bg-brand-secondary" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <EventList
          date={selectedDate}
          events={getEventsByDate(events, selectedDate)}
          onEventClick={onEventClick}
        />
      </div>
    </div>
  );
};