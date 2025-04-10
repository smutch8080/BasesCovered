import React, { useState } from 'react';
import { Game } from '../../types/game';
import { Event } from '../../types/events';
import { Edit2, Send, Trophy, Clock } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';

interface Props {
  game: Game;
  event: Event | null;
  onGameUpdated: (game: Game) => void;
  isCoach: boolean;
}

export const GameOverview: React.FC<Props> = ({
  game,
  event,
  onGameUpdated,
  isCoach
}) => {
  const [isEditingScore, setIsEditingScore] = useState(false);
  const [score, setScore] = useState({
    team: game.score?.team || 0,
    opponent: game.score?.opponent || 0
  });

  const handleStartGame = async () => {
    try {
      const gameRef = doc(db, 'games', game.id);
      await updateDoc(gameRef, {
        status: 'in_progress',
        updatedAt: new Date()
      });

      onGameUpdated({
        ...game,
        status: 'in_progress',
        updatedAt: new Date()
      });

      toast.success('Game started');
    } catch (error) {
      console.error('Error starting game:', error);
      toast.error('Failed to start game');
    }
  };

  const handleCompleteGame = async () => {
    try {
      const gameRef = doc(db, 'games', game.id);
      await updateDoc(gameRef, {
        status: 'completed',
        score,
        updatedAt: new Date()
      });

      onGameUpdated({
        ...game,
        status: 'completed',
        score,
        updatedAt: new Date()
      });

      toast.success('Game completed');
      setIsEditingScore(false);
    } catch (error) {
      console.error('Error completing game:', error);
      toast.error('Failed to complete game');
    }
  };

  const handleUpdateScore = async () => {
    try {
      const gameRef = doc(db, 'games', game.id);
      await updateDoc(gameRef, {
        score,
        updatedAt: new Date()
      });

      onGameUpdated({
        ...game,
        score,
        updatedAt: new Date()
      });

      toast.success('Score updated');
      setIsEditingScore(false);
    } catch (error) {
      console.error('Error updating score:', error);
      toast.error('Failed to update score');
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Game Status */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Game Status</h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Status</p>
                <p className="text-lg font-medium text-gray-800 dark:text-gray-200 capitalize">
                  {game.status.replace('_', ' ')}
                </p>
              </div>

              {/* Score Display/Editor */}
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-2">Score</p>
                {isEditingScore ? (
                  <div className="flex items-center gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400">
                        {game.isHomeTeam ? game.teamName : game.opponent}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={score.team}
                        onChange={(e) => setScore(prev => ({ ...prev, team: parseInt(e.target.value) || 0 }))}
                        className="w-20 px-2 py-1 border rounded text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400">
                        {game.isHomeTeam ? game.opponent : game.teamName}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={score.opponent}
                        onChange={(e) => setScore(prev => ({ ...prev, opponent: parseInt(e.target.value) || 0 }))}
                        className="w-20 px-2 py-1 border rounded text-center"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {game.score ? (
                      game.isHomeTeam ? (
                        <>{game.score.team} - {game.score.opponent}</>
                      ) : (
                        <>{game.score.opponent} - {game.score.team}</>
                      )
                    ) : (
                      '0 - 0'
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {isCoach && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              {game.status === 'scheduled' && (
                <button
                  onClick={handleStartGame}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-brand-primary text-white rounded-lg
                    hover:opacity-90 transition-colors"
                >
                  <Trophy className="w-5 h-5" />
                  Start Game
                </button>
              )}

              {game.status === 'in_progress' && (
                <>
                  <button
                    onClick={() => setIsEditingScore(true)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 
                      text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 
                      transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                    Update Score
                  </button>
                  <button
                    onClick={handleCompleteGame}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg
                      hover:bg-green-700 transition-colors"
                  >
                    <Clock className="w-5 h-5" />
                    End Game
                  </button>
                </>
              )}

              {isEditingScore && (
                <>
                  <button
                    onClick={() => setIsEditingScore(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 
                      text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 
                      transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateScore}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-brand-primary text-white rounded-lg
                      hover:opacity-90 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                    Save Score
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Game Notes */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Game Notes</h3>
        {game.notes ? (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{game.notes}</p>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 italic">No notes added yet</p>
        )}
      </div>
    </div>
  );
};