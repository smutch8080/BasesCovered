import React from 'react';
import { Link } from 'react-router-dom';
import { Users, MapPin, Trophy, Shield } from 'lucide-react';
import { Team } from '../../types/team';

interface Props {
  team: Team;
}

export const TeamCard: React.FC<Props> = ({ team }) => {
  const locationDisplay = team.location ? 
    `${team.location.city}, ${team.location.state}` : 
    'Location not set';

  return (
    <Link
      to={`/teams/${team.id}`}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            {team.logoUrl ? (
              <img
                src={team.logoUrl}
                alt={`${team.name} logo`}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <div>
              <h3 className="text-xl font-semibold text-gray-800">{team.name}</h3>
              <div className="flex items-center gap-2 text-gray-600 mt-1">
                <MapPin className="w-4 h-4" />
                <span>{locationDisplay}</span>
              </div>
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
          <span className="inline-block px-3 py-1 bg-brand-gradient text-white text-sm rounded-full">
            {team.ageDivision}
          </span>
        </div>
      </div>
    </Link>
  );
};