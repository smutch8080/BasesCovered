import React from 'react';
import { Shield, User } from 'lucide-react';
import { Player, Position, Team } from '../../types/team';
import { Homework } from '../../types/homework';
import { PlayerActionsMenu } from './PlayerActionsMenu';
import { PlayerHomeworkStatus } from './PlayerHomeworkStatus';
import { TeamRoleManager } from './TeamRoleManager';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  player: Player;
  teamId: string;
  team: Team;
  homework?: Homework[];
  onEdit?: () => void;
  onRemove?: () => void;
  onCreateReport?: () => void;
  onViewReports: () => void;
  onCreatePlan?: () => void;
  onTeamUpdated: (team: Team) => void;
}

export const PlayerCard: React.FC<Props> = ({
  player,
  teamId,
  team,
  homework = [],
  onEdit,
  onRemove,
  onCreateReport,
  onViewReports,
  onCreatePlan,
  onTeamUpdated
}) => {
  const { currentUser } = useAuth();

  // Check if user is a coach or admin
  const isCoach = currentUser && (
    currentUser.role === 'coach' || 
    currentUser.role === 'admin' ||
    team.coachId === currentUser.id ||
    team.coaches?.includes(currentUser.id)
  );

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="p-6">
        {/* Header with Avatar and Basic Info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{player.name}</h3>
              <p className="text-gray-500">#{player.jerseyNumber}</p>
            </div>
          </div>
          {isCoach && (
            <div className="relative z-10">
              <PlayerActionsMenu
                teamId={teamId}
                player={player}
                onEdit={onEdit}
                onRemove={onRemove}
                onCreateReport={onCreateReport}
                onViewReports={onViewReports}
                onCreatePlan={onCreatePlan}
              />
            </div>
          )}
        </div>

        {/* Player Details */}
        <div className="space-y-4">
          {/* Age */}
          <div className="text-sm text-gray-600">
            Age: {player.age}
          </div>

          {/* Positions */}
          <div className="flex flex-wrap gap-2">
            {player.positions.map((position: Position) => (
              <span
                key={position}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
              >
                <Shield className="w-3 h-3" />
                {position}
              </span>
            ))}
          </div>

          {/* Role and Homework Status */}
          <div className="flex items-center justify-between pt-4 border-t">
            {isCoach && (
              <TeamRoleManager
                team={team}
                player={player}
                onTeamUpdated={onTeamUpdated}
              />
            )}
            <PlayerHomeworkStatus
              homework={homework}
              playerId={player.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
};