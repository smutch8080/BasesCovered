import React from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { Calendar } from 'lucide-react';

export const CalendarWidget: React.FC = () => {
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-brand-primary" />
        <h2 className="text-lg font-semibold text-gray-800">Calendar</h2>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((date) => (
          <div key={date.toString()} className="text-center">
            <div className="text-xs text-gray-500 mb-1">
              {format(date, 'EEE')}
            </div>
            <div className={`p-2 rounded-full text-sm
              ${format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
                ? 'bg-brand-primary text-white'
                : 'hover:bg-gray-100'}`}
            >
              {format(date, 'd')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};