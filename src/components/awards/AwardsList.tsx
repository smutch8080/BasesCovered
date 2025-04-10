import React from 'react';
import { Trophy } from 'lucide-react';
import { PracticeAward } from '../../types';

interface Props {
  awards: PracticeAward[];
}

export const AwardsList: React.FC<Props> = ({ awards }) => {
  if (awards.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">No Awards Found</h2>
        <p className="text-gray-600">
          No awards match your current filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {awards.map((award) => (
        <div
          key={`${award.id}-${award.date.getTime()}`}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-6 h-6 text-brand-primary" />
            <div>
              <h3 className="font-semibold text-gray-800">{award.type}</h3>
              <p className="text-sm text-brand-primary">{award.category}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-gray-600">
              Awarded to: <span className="font-medium">{award.playerName}</span>
            </p>
            <p className="text-sm text-gray-500">
              {award.date.toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};