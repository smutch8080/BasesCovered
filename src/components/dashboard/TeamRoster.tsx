import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Shield } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Team } from '../../types/team';
import toast from 'react-hot-toast';

export const TeamRoster: React.FC = () => {
  const { currentUser } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTeams = async () => {
      if (!currentUser) return;

      try {
        setIsLoading(true);
        const teamsRef = collection(db, 'teams');
        const q = query(
          teamsRef,
          where('coachId', '==', currentUser.id)
        );
        
        const querySnapshot = await getDocs(q);
        const loadedTeams: Team[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          loadedTeams.push({
            ...data,
            id: doc.id,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          } as Team);
        });

        setTeams(loadedTeams);
      } catch (error) {
        console.error('Error loading teams:', error);
        toast.error('Unable to load team roster');
      } finally {
        setIsLoading(false);
      }
    };

    loadTeams();
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Team Roster</h2>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Team Roster</h2>
        <p className="text-center text-gray-500">No teams found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Team Roster</h2>
      
      <div className="space-y-6">
        {teams.map((team) => (
          <div key={team.id}>
            <h3 className="font-medium text-gray-700 mb-3">{team.name}</h3>
            <div className="space-y-3">
              {team.players.map((player) => (
                <Link
                  key={`${player.id}-${player.jerseyNumber}`}
                  to={`/teams/${team.id}/players/${player.id}`}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{player.name}</div>
                    <div className="text-sm text-gray-500">#{player.jerseyNumber}</div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Shield className="w-4 h-4" />
                    {player.positions[0]}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};