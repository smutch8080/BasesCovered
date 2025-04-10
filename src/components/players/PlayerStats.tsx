import React from 'react';
import { Shield } from 'lucide-react';
import { Player, Position } from '../../types/team';

interface Props {
  player: Player;
}

export const PlayerStats: React.FC<Props> = ({ player }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Player Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Jersey Number</h3>
          <p className="text-2xl font-bold text-brand-primary">#{player.jerseyNumber}</p>
        </div>

        <div>
          <h3 className="font-medium text-gray-700 mb-2">Positions</h3>
          <div className="flex flex-wrap gap-2">
            {player.positions.map((position: Position) => (
              <div 
                key={position}
                className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full"
              >
                <Shield className="w-4 h-4 text-brand-primary" />
                <span>{position}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};