import React from 'react';
import { Trophy } from 'lucide-react';
import { PracticeAward } from '../../types';

interface Props {
  awards: PracticeAward[];
}

export const PlayerAchievements: React.FC<Props> = ({ awards }) => {
  if (awards.length === 0) return null;

  // Group awards by category
  const awardsByCategory = awards.reduce((acc, award) => {
    if (!acc[award.category]) {
      acc[award.category] = [];
    }
    acc[award.category].push(award);
    return acc;
  }, {} as Record<string, PracticeAward[]>);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-brand-primary" />
        <h2 className="text-xl font-semibold text-gray-800">Awards & Achievements</h2>
      </div>
      
      <div className="space-y-6">
        {Object.entries(awardsByCategory).map(([category, categoryAwards]) => (
          <div key={category}>
            <h3 className="font-medium text-gray-800 mb-3">{category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryAwards.map((award) => (
                <div
                  key={`${award.id}-${award.date.getTime()}`}
                  className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-lg p-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Trophy className="w-5 h-5" />
                    <h4 className="font-medium">{award.type}</h4>
                  </div>
                  <p className="text-sm text-white/80 mt-2">
                    Awarded on {award.date.toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};