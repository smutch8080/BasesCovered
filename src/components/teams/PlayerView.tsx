import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ClipboardList } from 'lucide-react';
import { Team, Player } from '../../types/team';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  player: Player;
  team: Team;
}

export const PlayerView: React.FC<Props> = ({ player, team }) => {
  const { currentUser } = useAuth();

  // Check if current user is either the player or their parent
  const hasAccess = currentUser && (
    currentUser.id === player.id || 
    (team.parents?.includes(currentUser.id) && player.parentId === currentUser.id)
  );

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="flex gap-2">
      <Link
        to={`/teams/${team.id}/players/${player.id}/progress`}
        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg
          hover:bg-gray-700 transition-colors"
      >
        <FileText className="w-4 h-4" />
        Progress Reports
      </Link>
      <Link
        to={`/practice-plan`}
        state={{ playerId: player.id, playerName: player.name, teamId: team.id }}
        className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
          hover:opacity-90 transition-colors"
      >
        <ClipboardList className="w-4 h-4" />
        Practice Plans
      </Link>
    </div>
  );
};