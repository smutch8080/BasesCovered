import React from 'react';
import { format, isSameMonth, isSameDay, isToday } from 'date-fns';
import { Event } from '../../types/events';
import { EventList } from './EventList';
import { getCalendarDays, getEventsByDate } from '../../utils/calendarUtils';

interface Props {
  events: Event[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onEventClick?: (event: Event) => void;
}

export const MonthlyView: React.FC<Props> = ({
  events,
  selectedDate,
  onDateSelect,
  onEventClick
}) => {
  const calendarDays = getCalendarDays(selectedDate, 'month');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {/* Week day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((date) => {
          const dayEvents = getEventsByDate(events, date);
          const isSelected = isSameDay(date, selectedDate);
          const isCurrentMonth = isSameMonth(date, selectedDate);
          const isCurrentDay = isToday(date);

          return (
            <button
              key={date.toString()}
              onClick={() => onDateSelect(date)}
              className={`min-h-[100px] p-2 bg-white hover:bg-gray-50 transition-colors
                ${!isCurrentMonth && 'opacity-50'}
                ${isSelected && 'ring-2 ring-brand-primary'}
                ${isCurrentDay && 'bg-brand-primary/5'}`}
            >
              <div className="flex flex-col h-full">
                <span className={`text-sm font-medium mb-1
                  ${isSelected ? 'text-brand-primary' : 'text-gray-700'}`}>
                  {format(date, 'd')}
                </span>
                {dayEvents.length > 0 && (
                  <div className="flex flex-col gap-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className="text-xs px-1 py-0.5 rounded bg-brand-primary/10 text-brand-primary truncate"
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </div>
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