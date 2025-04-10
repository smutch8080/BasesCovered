import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '../../lib/firebase';
import { User } from '../../types/auth';
import { Team } from '../../types/team';
import { UserCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  team: Team;
  onTeamUpdated: (team: Team) => void;
}

export const CoachList: React.FC<Props> = ({ team, onTeamUpdated }) => {
  const [coachDetails, setCoachDetails] = useState<Record<string, User>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get all coach IDs including head coach and assistant coaches
  const allCoachIds = React.useMemo(() => {
    const ids = new Set<string>();
    if (team.coachId) ids.add(team.coachId);
    team.coaches?.forEach(id => ids.add(id));
    return Array.from(ids);
  }, [team.coachId, team.coaches]);

  useEffect(() => {
    const loadCoachDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const details: Record<string, User> = {};

        // Load details for each coach
        for (const coachId of allCoachIds) {
          try {
            // Validate coachId before querying
            if (!coachId || typeof coachId !== 'string') {
              console.warn('Invalid coach ID:', coachId);
              continue;
            }

            const coachDoc = await getDoc(doc(db, 'users', coachId));
            if (coachDoc.exists()) {
              details[coachId] = {
                id: coachDoc.id,
                ...coachDoc.data()
              } as User;
            } else {
              console.warn(`Coach ${coachId} not found`);
            }
          } catch (error) {
            console.error(`Error loading coach ${coachId}:`, error);
          }
        }

        setCoachDetails(details);
      } catch (error) {
        console.error('Error loading coach details:', error);
        setError('Failed to load coach details');
      } finally {
        setIsLoading(false);
      }
    };

    if (allCoachIds.length > 0) {
      loadCoachDetails();
    } else {
      setIsLoading(false);
    }
  }, [allCoachIds]);

  const handleRemoveCoach = async (coachId: string) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      // Don't allow removing the head coach
      if (coachId === team.coachId) {
        toast.error('Cannot remove head coach');
        return;
      }

      // Use Cloud Function to remove coach
      const functions = getFunctions();
      const removeCoachFromTeam = httpsCallable(functions, 'removeCoachFromTeam');
      
      const result = await removeCoachFromTeam({
        teamId: team.id,
        coachId
      });
      
      const response = result.data as { 
        success: boolean; 
        message?: string;
      };
      
      if (response.success) {
        // Update local state
        const updatedTeam = {
          ...team,
          coaches: team.coaches?.filter(id => id !== coachId) || []
        };
        onTeamUpdated(updatedTeam);
        
        toast.success('Coach removed successfully');
      } else {
        throw new Error(response.message || 'Failed to remove coach');
      }
    } catch (error) {
      console.error('Error removing coach:', error);
      toast.error('Failed to remove coach');
    } finally {
      setIsProcessing(false);
    }
  };

  if (error) {
    return (
      <div className="text-center py-4 text-red-600">
        {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
      </div>
    );
  }

  if (allCoachIds.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No coaches added yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {allCoachIds.map((coachId) => {
        const coach = coachDetails[coachId];
        if (!coach) return null;

        const isHeadCoach = coachId === team.coachId;

        return (
          <div
            key={coachId}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {coach.profilePicture ? (
                  <img
                    src={coach.profilePicture}
                    alt={coach.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserCircle className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div>
                <div className="font-medium text-gray-900">{coach.displayName}</div>
                <div className="text-sm text-gray-500">
                  {isHeadCoach ? 'Head Coach' : 'Assistant Coach'}
                </div>
              </div>
            </div>
            
            {!isHeadCoach && (
              <button
                onClick={() => handleRemoveCoach(coachId)}
                disabled={isProcessing}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full disabled:opacity-50"
                title="Remove coach"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};