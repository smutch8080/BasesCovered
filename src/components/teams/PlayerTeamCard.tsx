import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Trophy, Users, Shield, FileText, ClipboardList } from 'lucide-react';
import { Team } from '../../types/team';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  team: Team;
}

export const PlayerTeamCard: React.FC<Props> = ({ team }) => {
  const { currentUser } = useAuth();
  
  const locationDisplay = team.location ? 
    `${team.location.city}, ${team.location.state}` : 
    (team as any).city || 'Location not set';

  // Find the current user's player record in the team
  const playerRecord = team.players.find(p => p.id === currentUser?.id);

  return (
    <Link
      to={`/teams/${team.id}`}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{team.name}</h3>
            <div className="flex items-center gap-2 text-gray-600 mt-1">
              <MapPin className="w-4 h-4" />
              <span>{locationDisplay}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-brand-primary" />
            <span className="text-sm font-medium">{team.type}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Users className="w-4 h-4" />
          <span>{team.players?.length || 0} Players</span>
        </div>

        <div className="mt-4 pt-4 border-t">
          <span className="inline-block px-3 py-1 bg-brand-gradient text-white text-sm rounded-full mb-4">
            {team.ageDivision}
          </span>

          {playerRecord && (
            <div className="space-y-2">
              <Link
                to={`/teams/${team.id}/players/${playerRecord.id}/progress`}
                className="flex items-center gap-2 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg
                  hover:bg-gray-200 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <FileText className="w-4 h-4" />
                View Progress Reports
              </Link>
              <Link
                to={`/practice-plan`}
                state={{ playerId: playerRecord.id, playerName: playerRecord.name }}
                className="flex items-center gap-2 w-full px-4 py-2 bg-brand-primary text-white rounded-lg
                  hover:opacity-90 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ClipboardList className="w-4 h-4" />
                View Practice Plans
              </Link>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};