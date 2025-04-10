import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { League } from '../../types/league';
import toast from 'react-hot-toast';

interface Props {
  value?: string;
  onChange: (leagueId: string) => void;
  className?: string;
}

export const LeagueSelector: React.FC<Props> = ({ value, onChange, className = '' }) => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLeagues = async () => {
      try {
        setIsLoading(true);
        const leaguesRef = collection(db, 'leagues');
        const q = query(leaguesRef, orderBy('name'));
        const querySnapshot = await getDocs(q);
        
        const loadedLeagues: League[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          loadedLeagues.push({
            ...data,
            id: doc.id,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          } as League);
        });

        setLeagues(loadedLeagues);
      } catch (error) {
        console.error('Error loading leagues:', error);
        toast.error('Unable to load leagues');
      } finally {
        setIsLoading(false);
      }
    };

    loadLeagues();
  }, []);

  if (isLoading) {
    return (
      <select disabled className={`w-full px-4 py-2 border rounded-lg ${className}`}>
        <option>Loading leagues...</option>
      </select>
    );
  }

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary ${className}`}
    >
      <option value="">No league (optional)</option>
      {leagues.map((league) => (
        <option key={league.id} value={league.id}>
          {league.name} - {league.location.city}, {league.location.state}
        </option>
      ))}
    </select>
  );
};