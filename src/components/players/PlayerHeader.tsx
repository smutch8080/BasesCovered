import React from 'react';
import { User, Trophy, Calendar } from 'lucide-react';
import { Player } from '../../types/team';

interface Props {
  player: Player;
  teamName?: string;
}

export const PlayerHeader: React.FC<Props> = ({ player, teamName }) => {
  return (
    <div className="flex items-center gap-6">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
        <User className="w-12 h-12 text-gray-400" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{player.name}</h1>
        {teamName && (
          <div className="flex items-center gap-2 text-brand-primary mt-1">
            <Trophy className="w-4 h-4" />
            <span>{teamName}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-gray-600 mt-1">
          <Calendar className="w-4 h-4" />
          <span>Age: {player.age}</span>
        </div>
      </div>
    </div>
  );
};