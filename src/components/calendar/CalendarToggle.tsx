import React from 'react';
import { Calendar, CalendarDays } from 'lucide-react';

interface Props {
  view: 'weekly' | 'monthly';
  onViewChange: (view: 'weekly' | 'monthly') => void;
}

export const CalendarToggle: React.FC<Props> = ({ view, onViewChange }) => {
  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onViewChange('weekly')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors
          ${view === 'weekly' 
            ? 'bg-white text-brand-primary shadow-sm' 
            : 'text-gray-600 hover:text-gray-800'}`}
      >
        <CalendarDays className="w-4 h-4" />
        <span className="text-sm font-medium">Week</span>
      </button>
      <button
        onClick={() => onViewChange('monthly')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors
          ${view === 'monthly' 
            ? 'bg-white text-brand-primary shadow-sm' 
            : 'text-gray-600 hover:text-gray-800'}`}
      >
        <Calendar className="w-4 h-4" />
        <span className="text-sm font-medium">Month</span>
      </button>
    </div>
  );
};