import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Team } from '../../types/team';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Props {
  value?: string;
  onChange: (teamId: string, teamName: string) => void;
  className?: string;
}

export const TeamSelector: React.FC<Props> = ({ value, onChange, className = '' }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();

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
          loadedTeams.push({
            ...doc.data(),
            id: doc.id
          } as Team);
        });

        setTeams(loadedTeams);
      } catch (error) {
        console.error('Error loading teams:', error);
        toast.error('Unable to load teams');
      } finally {
        setIsLoading(false);
      }
    };

    loadTeams();
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const teamId = e.target.value;
    const team = teams.find(t => t.id === teamId);
    if (team) {
      onChange(team.id, team.name);
    }
  };

  if (isLoading) {
    return (
      <select disabled className={`w-full px-4 py-2 border rounded-lg ${className}`}>
        <option>Loading teams...</option>
      </select>
    );
  }

  return (
    <select
      value={value || ''}
      onChange={handleChange}
      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary ${className}`}
    >
      <option value="">Select a team...</option>
      {teams.map((team) => (
        <option key={team.id} value={team.id}>
          {team.name}
        </option>
      ))}
    </select>
  );
};