import React, { useState } from 'react';
import { Team } from '../../types/team';
import { UserCircle, Unlink, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import ParentAssignmentDialog from './ParentAssignmentDialog';

interface Props {
  team: Team;
  onTeamUpdated: (team: Team) => void;
}

export const ParentList: React.FC<Props> = ({ team, onTeamUpdated }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedParent, setSelectedParent] = useState<{id: string; name: string} | null>(null);

  const handleUnlinkPlayerParent = async (playerId: string, parentId: string) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      // Find the parent and player names for better messaging
      const parent = team.parents.find(p => p.id === parentId);
      const player = team.players.find(p => p.id === playerId);
      
      if (!parent || !player) {
        toast.error('Parent or player not found');
        return;
      }
      
      // Use the Cloud Function to unlink parent from player
      const functions = getFunctions();
      const unlinkParentFromPlayer = httpsCallable(functions, 'unlinkParentFromPlayer');
      
      const result = await unlinkParentFromPlayer({
        teamId: team.id,
        playerId: playerId,
        parentId: parentId
      });
      
      const response = result.data as {
        success: boolean;
        message?: string;
        player?: any;
      };
      
      if (response.success) {
        // Update the local state with the updated player
        const updatedPlayers = team.players.map(p => 
          p.id === playerId ? response.player : p
        );
        
        const updatedTeam = {
          ...team,
          players: updatedPlayers
        };
        
        onTeamUpdated(updatedTeam);
        toast.success(`Unlinked ${parent.name} from ${player.name}`);
      } else {
        throw new Error(response.message || 'Failed to unlink parent from player');
      }
    } catch (error) {
      console.error('Error unlinking parent from player:', error);
      toast.error('Failed to unlink parent from player');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAssignPlayer = (parent: {id: string; name: string}) => {
    setSelectedParent(parent);
  };

  // Process the data to show which players are assigned to each parent
  const parentWithPlayers = team.parents?.map(parent => {
    // Find all players that have this parent assigned
    const assignedPlayers = team.players.filter(player => 
      player.parents?.some(p => p.id === parent.id)
    );
    
    return {
      parent,
      assignedPlayers
    };
  }) || [];

  if (parentWithPlayers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No parents added yet
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {parentWithPlayers.map(({ parent, assignedPlayers }) => (
          <div
            key={parent.id}
            className="bg-white rounded-lg shadow p-4 border"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-medium">{parent.name}</h3>
                  <p className="text-sm text-gray-500">Parent</p>
                </div>
              </div>
              
              <button
                onClick={() => handleAssignPlayer(parent)}
                disabled={isProcessing}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full disabled:opacity-50"
                title="Assign player"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>

            <div className="border-t pt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Assigned Players ({assignedPlayers.length}):
              </p>
              
              {assignedPlayers.length > 0 ? (
                <ul className="space-y-2">
                  {assignedPlayers.map(player => (
                    <li key={player.id} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{player.name}</span>
                      <button
                        onClick={() => handleUnlinkPlayerParent(player.id, parent.id)}
                        disabled={isProcessing}
                        className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                        title="Unlink player"
                      >
                        <Unlink className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No players assigned</p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {selectedParent && (
        <ParentAssignmentDialog
          isOpen={!!selectedParent}
          onClose={() => setSelectedParent(null)}
          team={team}
          parentId={selectedParent.id}
          parentName={selectedParent.name}
          onTeamUpdated={onTeamUpdated}
        />
      )}
    </>
  );
};