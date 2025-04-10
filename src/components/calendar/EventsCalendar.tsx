import React, { useState } from 'react';
import { Event } from '../../types/events';
import { MonthlyView } from './MonthlyView';
import { WeeklyView } from './WeeklyView';
import { CalendarToggle } from './CalendarToggle';

interface Props {
  events: Event[];
  onEventClick?: (event: Event) => void;
}

export const EventsCalendar: React.FC<Props> = ({ events, onEventClick }) => {
  const [view, setView] = useState<'weekly' | 'monthly'>('weekly');
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Events Calendar</h2>
        <CalendarToggle view={view} onViewChange={setView} />
      </div>

      {view === 'weekly' ? (
        <WeeklyView
          events={events}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          onEventClick={onEventClick}
        />
      ) : (
        <MonthlyView
          events={events}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          onEventClick={onEventClick}
        />
      )}
    </div>
  );
};