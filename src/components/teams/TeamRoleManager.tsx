import React, { useState } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Team, Player } from '../../types/team';
import { Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Props {
  team: Team;
  player: Player;
  onTeamUpdated: (team: Team) => void;
}

export const TeamRoleManager: React.FC<Props> = ({ team, player, onTeamUpdated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();
  const isCoach = team.coaches?.includes(player.id);

  // Only head coach or admin can manage other coaches
  const canManageCoaches = currentUser && (
    currentUser.role === 'admin' || 
    currentUser.id === team.coachId
  );

  const handleToggleCoach = async () => {
    if (!canManageCoaches) {
      toast.error('Only the head coach can manage team coaches');
      return;
    }

    try {
      setIsLoading(true);
      const teamRef = doc(db, 'teams', team.id);
      const userRef = doc(db, 'users', player.id);

      // Get current user data to preserve other fields
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();

      if (isCoach) {
        // Remove from coaches array
        await updateDoc(teamRef, {
          coaches: arrayRemove(player.id),
          updatedAt: new Date()
        });

        // Update user's role if this was their only coaching position
        const isCoachElsewhere = userData.teams?.some((teamId: string) => 
          teamId !== team.id && userData.role === 'coach'
        );

        if (!isCoachElsewhere) {
          await updateDoc(userRef, {
            role: 'player'
          });
        }

        const updatedTeam = {
          ...team,
          coaches: team.coaches?.filter(id => id !== player.id) || []
        };
        onTeamUpdated(updatedTeam);
        toast.success(`${player.name} is no longer a coach`);
      } else {
        // Add to coaches array
        await updateDoc(teamRef, {
          coaches: arrayUnion(player.id),
          updatedAt: new Date()
        });

        // Update user's role
        await updateDoc(userRef, {
          role: 'coach'
        });

        const updatedTeam = {
          ...team,
          coaches: [...(team.coaches || []), player.id]
        };
        onTeamUpdated(updatedTeam);
        toast.success(`${player.name} is now a coach`);
      }
    } catch (error) {
      console.error('Error updating coach status:', error);
      toast.error('Failed to update coach status');
    } finally {
      setIsLoading(false);
    }
  };

  if (!canManageCoaches) {
    return (
      <div className="flex items-center gap-1 text-sm text-gray-700">
        {isCoach && (
          <>
            <Shield className="w-4 h-4" />
            Coach
          </>
        )}
      </div>
    );
  }

  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={isCoach}
        onChange={handleToggleCoach}
        disabled={isLoading}
        className="rounded text-brand-primary focus:ring-brand-primary"
      />
      <div className="flex items-center gap-1 text-sm text-gray-700">
        <Shield className="w-4 h-4" />
        Coach
      </div>
    </label>
  );
};