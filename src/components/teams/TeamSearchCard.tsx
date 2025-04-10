import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Trophy, Users, Shield } from 'lucide-react';
import { Team } from '../../types/team';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Props {
  team: Team & { coachName?: string };
}

export const TeamSearchCard: React.FC<Props> = ({ team }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleJoinClick = () => {
    if (!currentUser) {
      toast.error('Please sign in to join teams');
      navigate('/login');
      return;
    }

    // Check if user is already a member
    if (currentUser.teams?.includes(team.id)) {
      toast.error('You are already a member of this team');
      return;
    }

    // Check for pending request
    const hasPendingRequest = team.joinRequests?.some(
      request => request.userId === currentUser.id && request.status === 'pending'
    );

    if (hasPendingRequest) {
      toast.error('You already have a pending request to join this team');
      return;
    }

    // Navigate directly to join form
    navigate(`/teams/${team.id}/join`);
  };

  const locationDisplay = team.location ? 
    `${team.location.city}, ${team.location.state}` : 
    'Location not set';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            {team.logoUrl ? (
              <img
                src={team.logoUrl}
                alt={team.name}
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
          <span className="inline-block px-3 py-1 bg-brand-gradient text-white text-sm rounded-full mb-4">
            {team.ageDivision}
          </span>

          <button
            onClick={handleJoinClick}
            className="w-full px-4 py-2 bg-brand-primary text-white rounded-lg
              hover:opacity-90 transition-colors"
          >
            Request to Join
          </button>
        </div>
      </div>
    </div>
  );
};