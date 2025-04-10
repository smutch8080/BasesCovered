import React, { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Calendar } from 'lucide-react';
import { WeeklyEvent } from './WeeklyEvent';
import { MonthlyView } from './MonthlyView';
import { CalendarToggle } from './CalendarToggle';
import { Event } from '../../types/events';

interface Props {
  events: Event[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onEventClick?: (event: Event) => void;
}

export const WeeklyCalendar: React.FC<Props> = ({ 
  events, 
  selectedDate, 
  onDateSelect,
  onEventClick 
}) => {
  const [view, setView] = useState<'weekly' | 'monthly'>('weekly');
  const startDate = startOfWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  const getDayEvents = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.startDate), date));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-brand-primary" />
          <h2 className="text-xl font-semibold text-gray-800">This Week</h2>
        </div>
        <CalendarToggle view={view} onViewChange={setView} />
      </div>

      {view === 'weekly' ? (
        <>
          <div className="grid grid-cols-7 gap-4">
            {weekDays.map((date) => (
              <button
                key={date.toString()}
                onClick={() => onDateSelect(date)}
                className={`flex flex-col items-center p-3 rounded-lg transition-colors
                  ${isSameDay(date, selectedDate) 
                    ? 'bg-brand-primary text-white' 
                    : 'hover:bg-gray-50'}`}
              >
                <span className="text-sm font-medium">
                  {format(date, 'EEE')}
                </span>
                <span className="text-2xl font-bold mt-1">
                  {format(date, 'd')}
                </span>
                {getDayEvents(date).length > 0 && (
                  <div className="mt-2 w-2 h-2 rounded-full bg-brand-secondary" />
                )}
              </button>
            ))}
          </div>

          <div className="mt-6">
            <WeeklyEvent 
              date={selectedDate} 
              events={getDayEvents(selectedDate)}
              onEventClick={onEventClick}
            />
          </div>
        </>
      ) : (
        <MonthlyView
          events={events}
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
          onEventClick={onEventClick}
        />
      )}
    </div>
  );
};