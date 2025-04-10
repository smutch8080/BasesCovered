import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LeaderboardEntry } from '../../types/situational';
import { fetchLeaderboard } from '../../services/situational';
import { LeaderboardCard } from '../../components/situational/LeaderboardCard';
import toast from 'react-hot-toast';

function LeaderboardPage() {
  const [globalLeaders, setGlobalLeaders] = useState<LeaderboardEntry[]>([]);
  const [teamLeaders, setTeamLeaders] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadLeaderboards = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Ensure user is authenticated
        if (!currentUser) {
          throw new Error('Please sign in to view leaderboards');
        }

        // Load both leaderboards in parallel
        const [global, team] = await Promise.all([
          fetchLeaderboard(undefined, 10),
          currentUser.teams?.[0] ? fetchLeaderboard(currentUser.teams[0], 10) : []
        ]);

        setGlobalLeaders(global);
        setTeamLeaders(team);
      } catch (error: any) {
        console.error('Error loading leaderboards:', error);
        setError(error.message || 'Unable to load leaderboards');
        toast.error(error.message || 'Unable to load leaderboards');
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboards();
  }, [currentUser]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8 bg-white rounded-lg shadow-md">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Leaderboards</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <LeaderboardCard
          entries={globalLeaders}
          title="Global Rankings"
          type="global"
        />
        {teamLeaders.length > 0 && (
          <LeaderboardCard
            entries={teamLeaders}
            title="Team Rankings"
            type="team"
          />
        )}
      </div>
    </div>
  );
}

export default LeaderboardPage;