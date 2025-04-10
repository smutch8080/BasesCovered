import React from 'react';
import { Trophy } from 'lucide-react';

interface Props {
  title: string;
  date: { toDate: () => Date } | Date;
}

export const LessonBadge: React.FC<Props> = ({ title, date }) => {
  const displayDate = date instanceof Date ? date : date.toDate();

  return (
    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg text-white">
      <div className="p-3 bg-white/10 rounded-full">
        <Trophy className="w-8 h-8" />
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-white/80">
          Completed on {displayDate.toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};