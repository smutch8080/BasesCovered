import React, { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { PracticeAward } from '../../types';
import { fetchTeamAwards } from '../../services/awards';
import toast from 'react-hot-toast';

interface Props {
  teamId: string;
  players: { id: string; name: string }[];
}

interface PlayerAwards {
  playerId: string;
  playerName: string;
  awards: PracticeAward[];
}

export const TeamAwardsSection: React.FC<Props> = ({ teamId, players }) => {
  const [playerAwards, setPlayerAwards] = useState<PlayerAwards[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAwards = async () => {
      if (!teamId || players.length === 0) return;

      try {
        setIsLoading(true);
        setError(null);
        const awards = await fetchTeamAwards(teamId);

        // Create a map to store awards by player
        const awardsByPlayer = new Map<string, PracticeAward[]>();

        // Process all awards
        awards.forEach(award => {
          if (!award.playerId) return;
          const playerAwards = awardsByPlayer.get(award.playerId) || [];
          playerAwards.push(award);
          awardsByPlayer.set(award.playerId, playerAwards);
        });

        // Convert map to array and sort players by award count
        const awardsData = players
          .map(player => ({
            playerId: player.id,
            playerName: player.name,
            awards: (awardsByPlayer.get(player.id) || []).sort((a, b) => 
              b.date.getTime() - a.date.getTime()
            )
          }))
          .filter(player => player.awards.length > 0)
          .sort((a, b) => b.awards.length - a.awards.length);

        setPlayerAwards(awardsData);
      } catch (error) {
        console.error('Error loading team awards:', error);
        setError('Unable to load team awards. Please try again later.');
        toast.error('Unable to load team awards');
      } finally {
        setIsLoading(false);
      }
    };

    loadAwards();
  }, [teamId, players]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        {error}
      </div>
    );
  }

  if (playerAwards.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No awards given yet</p>
        <p className="text-sm text-gray-400 mt-2">
          Awards will appear here when they are given during practice sessions
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {playerAwards.map(({ playerId, playerName, awards }) => (
        <div key={playerId} className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-5 h-5 text-brand-primary" />
            <h3 className="text-xl font-semibold text-gray-800">
              {playerName}
              <span className="ml-2 text-sm text-gray-500">
                ({awards.length} award{awards.length !== 1 ? 's' : ''})
              </span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {awards.map((award) => (
              <div
                key={`${award.id}-${award.date.getTime()}`}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
              >
                <div className="font-medium text-gray-800">{award.type}</div>
                <div className="text-sm text-brand-primary mt-1">
                  {award.category}
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  Awarded on {award.date.toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};