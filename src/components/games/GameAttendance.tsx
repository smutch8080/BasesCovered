import React from 'react';
import { Game } from '../../types/game';
import { Event } from '../../types/events';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface Props {
  game: Game;
  event: Event | null;
  onGameUpdated: (game: Game) => void;
}

export const GameAttendance: React.FC<Props> = ({
  game,
  event,
  onGameUpdated
}) => {
  const loadPlayerDetails = async (playerId: string) => {
    try {
      const playerDoc = await getDoc(doc(db, 'users', playerId));
      if (playerDoc.exists()) {
        return playerDoc.data().displayName;
      }
      return 'Unknown Player';
    } catch (error) {
      console.error('Error loading player details:', error);
      return 'Unknown Player';
    }
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Confirmed Players */}
        <div>
          <h3 className="text-lg font-semibold text-green-600 dark:text-green-500 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Confirmed ({game.attendees.confirmed.length})
          </h3>
          <div className="space-y-2">
            {game.attendees.confirmed.map(async (playerId) => (
              <div
                key={playerId}
                className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
              >
                <span className="text-gray-800 dark:text-gray-200">
                  {await loadPlayerDetails(playerId)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Maybe Players */}
        <div>
          <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-500 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Maybe ({game.attendees.maybe.length})
          </h3>
          <div className="space-y-2">
            {game.attendees.maybe.map(async (playerId) => (
              <div
                key={playerId}
                className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
              >
                <span className="text-gray-800 dark:text-gray-200">
                  {await loadPlayerDetails(playerId)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Declined Players */}
        <div>
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-500 mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            Not Going ({game.attendees.declined.length})
          </h3>
          <div className="space-y-2">
            {game.attendees.declined.map(async (playerId) => (
              <div
                key={playerId}
                className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
              >
                <span className="text-gray-800 dark:text-gray-200">
                  {await loadPlayerDetails(playerId)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};