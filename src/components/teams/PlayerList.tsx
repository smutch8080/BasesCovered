import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Player, Team } from '../../types/team';
import { PlayerActionsMenu } from './PlayerActionsMenu';
import { PlayerViewDialog } from './PlayerViewDialog';
import { TeamRoleManager } from './TeamRoleManager';
import { EditPlayerDialog } from './EditPlayerDialog';
import { Homework } from '../../types/homework';
import { PlayerHomeworkStatus } from './PlayerHomeworkStatus';
import toast from 'react-hot-toast';

interface Props {
  players: Player[];
  team: Team;
  teamId: string;
  onPlayersUpdated: (players: Player[]) => void;
  onTeamUpdated: (team: Team) => void;
}

export const PlayerList: React.FC<Props> = ({ 
  players, 
  team,
  teamId, 
  onPlayersUpdated,
  onTeamUpdated
}) => {
  const navigate = useNavigate();
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [viewingPlayer, setViewingPlayer] = useState<Player | null>(null);
  const [homework, setHomework] = useState<Homework[]>([]);

  useEffect(() => {
    const loadHomework = async () => {
      try {
        const homeworkRef = collection(db, 'homework');
        const q = query(
          homeworkRef,
          where('teamId', '==', teamId),
          orderBy('dueDate', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const loadedHomework: Homework[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          loadedHomework.push({
            ...data,
            id: doc.id,
            dueDate: data.dueDate.toDate(),
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          } as Homework);
        });

        setHomework(loadedHomework);
      } catch (error) {
        console.error('Error loading homework:', error);
      }
    };

    loadHomework();
  }, [teamId]);

  const handleUpdatePlayer = async (updatedPlayer: Player) => {
    try {
      const updatedPlayers = players.map(p => 
        p.id === updatedPlayer.id ? updatedPlayer : p
      );

      await updateDoc(doc(db, 'teams', teamId), {
        players: updatedPlayers,
        updatedAt: new Date()
      });

      onPlayersUpdated(updatedPlayers);
      setEditingPlayer(null);
      toast.success('Player updated successfully');
    } catch (error) {
      console.error('Error updating player:', error);
      toast.error('Failed to update player');
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    try {
      const updatedPlayers = players.filter(p => p.id !== playerId);
      
      await updateDoc(doc(db, 'teams', teamId), {
        players: updatedPlayers,
        updatedAt: new Date()
      });

      onPlayersUpdated(updatedPlayers);
      toast.success('Player removed successfully');
    } catch (error) {
      console.error('Error removing player:', error);
      toast.error('Failed to remove player');
    }
  };

  if (players.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No players added yet
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">#</th>
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Age</th>
              <th className="text-left py-3 px-4">Positions</th>
              <th className="text-left py-3 px-4">Role</th>
              <th className="text-left py-3 px-4">Homework</th>
              <th className="text-right py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{player.jerseyNumber}</td>
                <td className="py-3 px-4">{player.name}</td>
                <td className="py-3 px-4">{player.age}</td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {player.positions.map((position) => (
                      <span
                        key={position}
                        className="px-2 py-1 bg-gray-100 rounded-full text-xs"
                      >
                        {position}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <TeamRoleManager
                    team={team}
                    player={player}
                    onTeamUpdated={onTeamUpdated}
                  />
                </td>
                <td className="py-3 px-4">
                  <PlayerHomeworkStatus
                    homework={homework}
                    playerId={player.id}
                  />
                </td>
                <td className="py-3 px-4 text-right">
                  <PlayerActionsMenu
                    teamId={teamId}
                    player={player}
                    onEdit={() => setEditingPlayer(player)}
                    onRemove={() => handleRemovePlayer(player.id)}
                    onCreateReport={() => navigate(`/teams/${teamId}/players/${player.id}/progress/new`)}
                    onViewReports={() => navigate(`/teams/${teamId}/players/${player.id}/progress`)}
                    onCreatePlan={() => navigate('/practice-plan/new', { 
                      state: { 
                        playerId: player.id,
                        playerName: player.name,
                        teamId 
                      }
                    })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EditPlayerDialog
        isOpen={!!editingPlayer}
        onClose={() => setEditingPlayer(null)}
        player={editingPlayer}
        onPlayerUpdated={handleUpdatePlayer}
      />

      <PlayerViewDialog
        isOpen={!!viewingPlayer}
        onClose={() => setViewingPlayer(null)}
        player={viewingPlayer}
      />
    </>
  );
};