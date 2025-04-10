import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Team } from '../../types/team';
import { getFunctions, httpsCallable } from 'firebase/functions';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
  parentId: string;
  parentName: string;
  onTeamUpdated: (team: Team) => void;
}

export default function ParentAssignmentDialog({
  isOpen,
  onClose,
  team,
  parentId,
  parentName,
  onTeamUpdated
}: Props) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleAssignParent = async () => {
    if (!selectedPlayerId || isProcessing) return;

    try {
      setIsProcessing(true);
      console.log(`Assigning parent ${parentId} to player ${selectedPlayerId}`);

      // Use Cloud Function to assign parent
      const functions = getFunctions();
      const assignParentToPlayer = httpsCallable(functions, 'assignParentToPlayer');
      
      const result = await assignParentToPlayer({
        teamId: team.id,
        playerId: selectedPlayerId,
        parentId: parentId,
        parentName: parentName
      });
      
      const response = result.data as { 
        success: boolean;
        message?: string;
      };
      
      if (response.success) {
        // We need to keep the local state in sync
        // Find the assigned player in our current team state
        const updatedPlayers = team.players.map(player => {
          if (player.id === selectedPlayerId) {
            // Check if parent already assigned
            if (!player.parents) {
              return {
                ...player,
                parents: [{ id: parentId, name: parentName }]
              };
            }
            
            // Check if this parent already exists for this player
            const parentExists = player.parents.some(p => p.id === parentId);
            if (!parentExists) {
              return {
                ...player,
                parents: [...player.parents, { id: parentId, name: parentName }]
              };
            }
          }
          return player;
        });

        // Make sure the parent is in the parents array for the team
        let parentExists = false;
        const existingParents = team.parents || [];
        for (const parent of existingParents) {
          if (parent.id === parentId) {
            parentExists = true;
            break;
          }
        }

        const updatedParents = parentExists 
          ? existingParents 
          : [...existingParents, { id: parentId, name: parentName }];

        // Update the team state locally
        const updatedTeam = {
          ...team,
          players: updatedPlayers,
          parents: updatedParents
        };

        onTeamUpdated(updatedTeam);
        toast.success(`Assigned ${parentName} as parent to player`);
        onClose();
      } else {
        throw new Error(response.message || 'Failed to assign parent');
      }
    } catch (error) {
      console.error('Error assigning parent:', error);
      toast.error('Failed to assign parent');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <Dialog.Title className="text-xl font-bold mb-4">
            Assign Parent to Player
          </Dialog.Title>
          
          <p className="mb-4">Select a player to assign <strong>{parentName}</strong> as a parent:</p>
          
          <div className="space-y-2 mb-6">
            <select
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select a player</option>
              {team.players?.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              onClick={handleAssignParent}
              disabled={!selectedPlayerId || isProcessing}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};