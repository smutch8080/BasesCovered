import React, { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { PracticeAward } from '../types';
import { AwardsList } from '../components/awards/AwardsList';
import { AwardsFilter } from '../components/awards/AwardsFilter';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserAwards } from '../services/awards';
import toast from 'react-hot-toast';

function AwardsPage() {
  const [awards, setAwards] = useState<PracticeAward[]>([]);
  const [filteredAwards, setFilteredAwards] = useState<PracticeAward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadAwards = async () => {
      if (!currentUser) return;

      try {
        setIsLoading(true);
        setError(null);
        const loadedAwards = await fetchUserAwards(currentUser);
        setAwards(loadedAwards);
        setFilteredAwards(loadedAwards);
      } catch (error) {
        console.error('Error loading awards:', error);
        setError('Unable to load awards. Please try again later.');
        toast.error('Unable to load awards');
      } finally {
        setIsLoading(false);
      }
    };

    loadAwards();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Please sign in to view awards</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="w-8 h-8 text-brand-primary" />
        <h1 className="text-3xl font-bold text-gray-800">Awards</h1>
      </div>

      <AwardsFilter
        awards={awards}
        onFilteredAwardsChange={setFilteredAwards}
      />

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading awards...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">
          {error}
        </div>
      ) : (
        <AwardsList awards={filteredAwards} />
      )}
    </div>
  );
}

export default AwardsPage;