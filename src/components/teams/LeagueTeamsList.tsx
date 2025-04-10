import React from 'react';
import { Link } from 'react-router-dom';
import { Team } from '../../types/team';
import { Users, Plus } from 'lucide-react';

interface Props {
  teams: Team[];
  leagueId: string;
}

export const LeagueTeamsList: React.FC<Props> = ({ teams, leagueId }) => {
  if (teams.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No teams in league yet</p>
        <Link
          to="/teams/new"
          className="inline-flex items-center gap-2 px-4 py-2 mt-4 bg-brand-primary text-white rounded-lg
            hover:opacity-90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add First Team
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {teams.map((team) => (
        <Link
          key={team.id}
          to={`/teams/${team.id}`}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
        >
          <div>
            <h3 className="font-medium text-gray-800">{team.name}</h3>
            <p className="text-sm text-gray-500">
              {team.ageDivision} • {team.type}
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {team.players?.length || 0} players
          </div>
        </Link>
      ))}
    </div>
  );
};