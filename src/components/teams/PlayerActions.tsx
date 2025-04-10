import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ClipboardList } from 'lucide-react';
import { Player } from '../../types/team';

interface Props {
  player: Player;
  teamId: string;
}

export const PlayerActions: React.FC<Props> = ({ player, teamId }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Link
        to={`/teams/${teamId}/players/${player.id}/progress`}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg
          hover:bg-gray-700 transition-colors whitespace-nowrap"
      >
        <FileText className="w-4 h-4" />
        Progress Reports
      </Link>
      <Link
        to="/practice-plan"
        state={{ playerId: player.id, playerName: player.name, teamId }}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
          hover:opacity-90 transition-colors whitespace-nowrap"
      >
        <ClipboardList className="w-4 h-4" />
        Practice Plans
      </Link>
    </div>
  );
};