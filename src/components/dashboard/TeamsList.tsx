import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock } from 'lucide-react';
import { Team } from '../../types/team';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  teams: Team[];
  pendingRequests: {
    teamId: string;
    teamName: string;
    status: 'pending' | 'approved' | 'declined';
    createdAt: Date;
  }[];
}

export const TeamsList: React.FC<Props> = ({ teams, pendingRequests }) => {
  const { currentUser } = useAuth();

  // Debug logging
  console.log('TeamsList render:', {
    currentUser: {
      id: currentUser?.id,
      role: currentUser?.role,
      teams: currentUser?.teams
    },
    teamsCount: teams.length,
    pendingRequestsCount: pendingRequests.length
  });

  if (teams.length === 0 && pendingRequests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Teams Yet</h3>
          <p className="text-gray-600 mb-4">Join a team or wait for your requests to be approved.</p>
          <Link
            to="/teams/find"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90"
          >
            Find Teams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-brand-primary" />
          <h2 className="text-lg font-semibold text-gray-800">My Teams</h2>
        </div>
        <Link
          to="/teams"
          className="text-brand-primary hover:opacity-90 text-sm"
        >
          View All
        </Link>
      </div>

      <div className="space-y-4">
        {teams.map((team) => (
          <Link
            key={team.id}
            to={`/teams/${team.id}`}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
          >
            <div className="flex items-center gap-3">
              {team.logoUrl ? (
                <img
                  src={team.logoUrl}
                  alt={team.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-400" />
                </div>
              )}
              <div>
                <h3 className="font-medium text-gray-800">{team.name}</h3>
                <p className="text-sm text-gray-500">
                  {team.location.city}, {team.location.state}
                </p>
              </div>
            </div>
            <span className="text-sm text-gray-500">
              {team.type} • {team.ageDivision}
            </span>
          </Link>
        ))}

        {pendingRequests.map((request) => (
          <div
            key={request.teamId}
            className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">{request.teamName}</h3>
                <p className="text-sm text-yellow-600">
                  Request pending approval • {request.createdAt.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
