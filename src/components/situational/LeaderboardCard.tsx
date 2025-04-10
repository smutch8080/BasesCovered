import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  gamesPlayed: number;
  averageScore: number;
  rank: number;
}

interface Props {
  entries: LeaderboardEntry[];
  title: string;
  type: 'team' | 'global';
}

export const LeaderboardCard: React.FC<Props> = ({ entries, title, type }) => {
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <span className="px-3 py-1 text-sm bg-brand-gradient text-white rounded-full">
          {type === 'team' ? 'Team' : 'Global'}
        </span>
      </div>

      <div className="space-y-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={`flex items-center justify-between p-4 rounded-lg ${
              entry.rank <= 3 ? 'bg-gray-50' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-8 flex justify-center">
                {getPositionIcon(entry.rank) || (
                  <span className="text-gray-500 font-medium">{entry.rank}</span>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-800">{entry.name}</p>
                <p className="text-sm text-gray-500">
                  {entry.gamesPlayed} scenarios completed
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-brand-primary">{entry.score}</p>
              <p className="text-sm text-gray-500">
                {Math.round(entry.averageScore)}% avg
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};