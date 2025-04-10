import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Player } from '../../types/team';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  teamId: string;
  onPlayerSelect: (player: Player) => void;
}

export const PlayerSelector: React.FC<Props> = ({ teamId, onPlayerSelect }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPlayers = async () => {
      if (!teamId) return;

      try {
        setIsLoading(true);
        const teamDoc = await getDocs(query(
          collection(db, 'teams'),
          where('__name__', '==', teamId)
        ));

        if (!teamDoc.empty) {
          const teamData = teamDoc.docs[0].data();
          setPlayers(teamData.players || []);
        }
      } catch (error) {
        console.error('Error loading players:', error);
        toast.error('Failed to load players');
      } finally {
        setIsLoading(false);
      }
    };

    loadPlayers();
  }, [teamId]);

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search players..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      {isLoading ? (
        <p className="text-center text-gray-600">Loading players...</p>
      ) : filteredPlayers.length > 0 ? (
        <div className="space-y-2">
          {filteredPlayers.map((player) => (
            <button
              key={player.id}
              onClick={() => onPlayerSelect(player)}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left"
            >
              <div>
                <div className="font-medium">{player.name}</div>
                <div className="text-sm text-gray-500">#{player.jerseyNumber}</div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No players found</p>
      )}
    </div>
  );
};