import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Player, Team } from '../../types/team';
import { Homework } from '../../types/homework';
import { PlayerCard } from './PlayerCard';
import { EditPlayerDialog } from './EditPlayerDialog';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { doc, updateDoc, getFirestore, serverTimestamp, arrayRemove } from 'firebase/firestore';

interface Props {
  players: Player[];
  teamId: string;
  team: Team;
  homework?: Homework[];
  onPlayersUpdated: (players: Player[]) => void;
  onTeamUpdated: (team: Team) => void;
}

export const PlayerGrid: React.FC<Props> = ({
  players,
  teamId,
  team,
  homework = [],
  onPlayersUpdated,
  onTeamUpdated
}) => {
  const navigate = useNavigate();
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { currentUser } = useAuth();

  // Filter out any players that are also coaches
  const activePlayers = players.filter(player => 
    !team.coaches?.includes(player.id) && player.id !== team.coachId
  );

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
  };

  const handleUpdatePlayer = async (updatedPlayer: Player) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      // Use Cloud Function to update player
      const functions = getFunctions();
      const updatePlayerDetails = httpsCallable(functions, 'updatePlayerDetails');
      
      const result = await updatePlayerDetails({
        teamId,
        playerId: updatedPlayer.id,
        playerData: updatedPlayer
      });
      
      const response = result.data as { 
        success: boolean; 
        player: Player;
        message?: string;
      };
      
      if (response.success) {
        const updatedPlayers = players.map(p => 
          p.id === updatedPlayer.id ? response.player : p
        );
        
        onPlayersUpdated(updatedPlayers);
        setEditingPlayer(null);
        toast.success('Player updated successfully');
      } else {
        throw new Error(response.message || 'Failed to update player');
      }
    } catch (error) {
      console.error('Error updating player:', error);
      toast.error('Failed to update player');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      // Get Firestore instance
      const db = getFirestore();
      
      // Filter out the player to be removed
      const updatedPlayers = players.filter(p => p.id !== playerId);
      
      // Update the team document directly
      const teamRef = doc(db, 'teams', teamId);
      await updateDoc(teamRef, {
        players: updatedPlayers,
        updatedAt: serverTimestamp()
      });
      
      // Update local state to reflect the changes
      onPlayersUpdated(updatedPlayers);
      onTeamUpdated({
        ...team,
        players: updatedPlayers,
        updatedAt: new Date()
      });
      
      // Also update the user's teams array (not critical for UI)
      try {
        const userRef = doc(db, 'users', playerId);
        // Use arrayRemove to remove the teamId from user's teams array
        await updateDoc(userRef, {
          teams: arrayRemove(teamId),
          updatedAt: serverTimestamp()
        });
      } catch (userError) {
        // Log but don't fail the operation
        console.warn('Could not update user document:', userError);
      }
      
      toast.success('Player removed successfully');
    } catch (error: any) {
      console.error('Error removing player:', error);
      const errorMessage = error?.message || 'Failed to remove player';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateReport = (playerId: string) => {
    navigate(`/teams/${teamId}/players/${playerId}/progress/new`);
  };

  const handleViewReports = (playerId: string) => {
    navigate(`/teams/${teamId}/players/${playerId}/progress`);
  };

  const handleCreatePlan = (playerId: string, playerName: string) => {
    navigate('/practice-plan/new', { 
      state: { 
        playerId,
        playerName,
        teamId 
      }
    });
  };

  // Check if user is a coach or admin
  const isCoach = currentUser && (
    currentUser.role === 'coach' || 
    currentUser.role === 'admin' ||
    team.coachId === currentUser.id ||
    team.coaches?.includes(currentUser.id)
  );

  if (activePlayers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No players added yet
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activePlayers.map((player) => (
          <PlayerCard
            key={`${player.id}-${player.jerseyNumber}`}
            player={player}
            teamId={teamId}
            team={team}
            homework={homework}
            onEdit={isCoach ? () => handleEditPlayer(player) : undefined}
            onRemove={isCoach ? () => handleRemovePlayer(player.id) : undefined}
            onCreateReport={isCoach ? () => handleCreateReport(player.id) : undefined}
            onViewReports={() => handleViewReports(player.id)}
            onCreatePlan={isCoach ? () => handleCreatePlan(player.id, player.name) : undefined}
            onTeamUpdated={onTeamUpdated}
          />
        ))}
      </div>

      <EditPlayerDialog
        isOpen={!!editingPlayer}
        onClose={() => setEditingPlayer(null)}
        player={editingPlayer}
        onPlayerUpdated={handleUpdatePlayer}
        isProcessing={isProcessing}
      />
    </>
  );
};