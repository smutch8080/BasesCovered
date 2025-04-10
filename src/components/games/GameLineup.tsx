import React, { useState, useEffect } from 'react';
import { Game } from '../../types/game';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Player, Position } from '../../types/team';
import { Plus, ChevronUp, ChevronDown, X } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import toast from 'react-hot-toast';

interface Props {
  game: Game;
  onGameUpdated: (game: Game) => void;
  isCoach: boolean;
}

interface LineupPlayer {
  id: string;
  name: string;
  jerseyNumber: string;
  position: Position;
  order: number;
  status: 'confirmed' | 'pending' | 'unavailable';
}

interface TeamLineup {
  home: LineupPlayer[];
  away: LineupPlayer[];
}

interface GenericPlayer {
  name: string;
  jerseyNumber: string;
  position: Position;
}

export const GameLineup: React.FC<Props> = ({
  game,
  onGameUpdated,
  isCoach
}) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [lineups, setLineups] = useState<TeamLineup>({ home: [], away: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTeam, setActiveTeam] = useState<'home' | 'away'>('home');
  const [showAddPlayerDialog, setShowAddPlayerDialog] = useState(false);
  const [showAddGenericDialog, setShowAddGenericDialog] = useState(false);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [genericPlayer, setGenericPlayer] = useState<GenericPlayer>({
    name: '',
    jerseyNumber: '',
    position: Position.Pitcher
  });

  useEffect(() => {
    loadTeamPlayers();
  }, []);

  useEffect(() => {
    // Update available players whenever lineup changes
    if (players.length > 0) {
      const currentLineup = lineups[activeTeam];
      const lineupPlayerIds = new Set(currentLineup.map(p => p.id));
      setAvailablePlayers(players.filter(p => !lineupPlayerIds.has(p.id)));
    }
  }, [players, lineups, activeTeam]);

  const loadTeamPlayers = async () => {
    try {
      setIsLoading(true);
      const teamDoc = await getDoc(doc(db, 'teams', game.teamId));
      if (teamDoc.exists()) {
        const teamData = teamDoc.data();
        const teamPlayers = teamData.players || [];
        setPlayers(teamPlayers);

        // Initialize lineups from game data or create new ones with all players
        let homeLineup: LineupPlayer[] = [];
        let awayLineup: LineupPlayer[] = [];

        if (game.homeLineup?.length) {
          // Use existing lineup if available
          homeLineup = game.homeLineup.map((player, index) => {
            const teamPlayer = teamPlayers.find(p => p.id === player.id);
            return {
              id: player.id,
              name: teamPlayer?.name || player.name || '',
              jerseyNumber: teamPlayer?.jerseyNumber || player.jerseyNumber || '',
              position: player.position,
              order: index + 1,
              status: 'confirmed'
            };
          });
        } else if (game.isHomeTeam) {
          // Preload with all team players if this is our team
          homeLineup = teamPlayers.map((player, index) => ({
            id: player.id,
            name: player.name,
            jerseyNumber: player.jerseyNumber,
            position: player.positions[0] || Position.Pitcher,
            order: index + 1,
            status: 'confirmed'
          }));
        }

        if (game.awayLineup?.length) {
          // Use existing lineup if available
          awayLineup = game.awayLineup.map((player, index) => {
            const teamPlayer = teamPlayers.find(p => p.id === player.id);
            return {
              id: player.id,
              name: teamPlayer?.name || player.name || '',
              jerseyNumber: teamPlayer?.jerseyNumber || player.jerseyNumber || '',
              position: player.position,
              order: index + 1,
              status: 'confirmed'
            };
          });
        } else if (!game.isHomeTeam) {
          // Preload with all team players if this is our team
          awayLineup = teamPlayers.map((player, index) => ({
            id: player.id,
            name: player.name,
            jerseyNumber: player.jerseyNumber,
            position: player.positions[0] || Position.Pitcher,
            order: index + 1,
            status: 'confirmed'
          }));
        }

        setLineups({ home: homeLineup, away: awayLineup });
      }
    } catch (error) {
      console.error('Error loading team players:', error);
      toast.error('Unable to load team players');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPlayer = (player: Player) => {
    const newLineupPlayer: LineupPlayer = {
      id: player.id,
      name: player.name,
      jerseyNumber: player.jerseyNumber,
      position: player.positions[0] || Position.Pitcher,
      order: lineups[activeTeam].length + 1,
      status: 'confirmed'
    };

    setLineups(prev => ({
      ...prev,
      [activeTeam]: [...prev[activeTeam], newLineupPlayer]
    }));
    setShowAddPlayerDialog(false);
  };

  const handleAddGenericPlayer = () => {
    if (!genericPlayer.jerseyNumber || !genericPlayer.position) {
      toast.error('Jersey number and position are required');
      return;
    }

    const newLineupPlayer: LineupPlayer = {
      id: `generic-${Date.now()}`,
      name: genericPlayer.name || `Player #${genericPlayer.jerseyNumber}`,
      jerseyNumber: genericPlayer.jerseyNumber,
      position: genericPlayer.position,
      order: lineups[activeTeam].length + 1,
      status: 'confirmed'
    };

    setLineups(prev => ({
      ...prev,
      [activeTeam]: [...prev[activeTeam], newLineupPlayer]
    }));

    // Reset form
    setGenericPlayer({
      name: '',
      jerseyNumber: '',
      position: Position.Pitcher
    });
    setShowAddGenericDialog(false);
  };

  const handleRemovePlayer = (playerId: string) => {
    setLineups(prev => {
      const newLineup = prev[activeTeam].filter(p => p.id !== playerId);
      // Update order numbers
      const updatedLineup = newLineup.map((player, index) => ({
        ...player,
        order: index + 1
      }));

      return {
        ...prev,
        [activeTeam]: updatedLineup
      };
    });
  };

  const handleMovePlayer = (playerId: string, direction: 'up' | 'down') => {
    setLineups(prev => {
      const currentLineup = [...prev[activeTeam]];
      const currentIndex = currentLineup.findIndex(p => p.id === playerId);
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (newIndex >= 0 && newIndex < currentLineup.length) {
        // Swap players
        [currentLineup[currentIndex], currentLineup[newIndex]] = 
        [currentLineup[newIndex], currentLineup[currentIndex]];
        // Update order numbers
        currentLineup.forEach((player, i) => {
          player.order = i + 1;
        });
      }

      return {
        ...prev,
        [activeTeam]: currentLineup
      };
    });
  };

  const handleSaveLineup = async () => {
    try {
      const homeLineupData = lineups.home.map(player => ({
        id: player.id,
        name: player.name,
        jerseyNumber: player.jerseyNumber,
        position: player.position,
        order: player.order
      }));

      const awayLineupData = lineups.away.map(player => ({
        id: player.id,
        name: player.name,
        jerseyNumber: player.jerseyNumber,
        position: player.position,
        order: player.order
      }));

      await updateDoc(doc(db, 'games', game.id), {
        homeLineup: homeLineupData,
        awayLineup: awayLineupData,
        updatedAt: new Date()
      });
      
      onGameUpdated({
        ...game,
        homeLineup: homeLineupData,
        awayLineup: awayLineupData,
        updatedAt: new Date()
      });
      
      toast.success('Lineup saved successfully');
    } catch (error) {
      console.error('Error saving lineup:', error);
      toast.error('Failed to save lineup');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
      </div>
    );
  }

  const currentLineup = lineups[activeTeam];
  const isTeamCoach = isCoach && (
    (activeTeam === 'home' && game.isHomeTeam) ||
    (activeTeam === 'away' && !game.isHomeTeam)
  );

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Lineup Management</h2>
          <p className="text-gray-600 mt-1">Manage team lineups and batting order</p>
        </div>
        {isCoach && (
          <div className="flex gap-2">
            {isTeamCoach ? (
              <button
                onClick={() => setShowAddPlayerDialog(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-brand-primary text-white rounded-lg
                  hover:opacity-90 transition-colors text-sm sm:text-base w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                Add Team Player
              </button>
            ) : (
              <button
                onClick={() => setShowAddGenericDialog(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-brand-primary text-white rounded-lg
                  hover:opacity-90 transition-colors text-sm sm:text-base w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                Add Opponent Player
              </button>
            )}
          </div>
        )}
      </div>

      {/* Team Tabs */}
      <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
        <button
          onClick={() => setActiveTeam('home')}
          className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base flex-1 sm:flex-none ${
            activeTeam === 'home'
              ? 'bg-brand-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {game.isHomeTeam ? game.teamName : game.opponent} Lineup
        </button>
        <button
          onClick={() => setActiveTeam('away')}
          className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base flex-1 sm:flex-none ${
            activeTeam === 'away'
              ? 'bg-brand-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {game.isHomeTeam ? game.opponent : game.teamName} Lineup
        </button>
      </div>

      {/* Lineup Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Table Header - Hide on mobile, show on tablets and up */}
        <div className="hidden sm:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b">
          <div className="col-span-1 font-medium text-gray-600">Order</div>
          <div className="col-span-4 font-medium text-gray-600">Player</div>
          <div className="col-span-3 font-medium text-gray-600">Position</div>
          <div className="col-span-2 font-medium text-gray-600">Status</div>
          <div className="col-span-2 font-medium text-gray-600">Actions</div>
        </div>

        <div className="divide-y">
          {currentLineup.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No players added to the lineup yet
            </div>
          ) : (
            currentLineup.map((player, index) => (
              <div key={player.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 p-4 items-center hover:bg-gray-50">
                {/* Mobile layout is stacked vertically */}
                <div className="flex items-center justify-between sm:hidden mb-3">
                  <div className="font-medium flex items-center">
                    <span className="bg-gray-100 rounded-full w-7 h-7 flex items-center justify-center mr-2 flex-shrink-0">{player.order}</span>
                    <span className="truncate">{player.name}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {isCoach && (
                      <>
                        <button
                          onClick={() => handleMovePlayer(player.id, 'up')}
                          disabled={index === 0}
                          className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                        >
                          <ChevronUp className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleMovePlayer(player.id, 'down')}
                          disabled={index === currentLineup.length - 1}
                          className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                        >
                          <ChevronDown className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleRemovePlayer(player.id)}
                          className="p-2 text-red-600 hover:text-red-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex sm:hidden text-sm text-gray-500 justify-between mb-3">
                  <div className="font-medium">#{player.jerseyNumber}</div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                    bg-green-100 text-green-800">
                    {player.status}
                  </span>
                </div>
                
                <div className="sm:hidden w-full mb-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Position</label>
                  <select
                    value={player.position}
                    onChange={(e) => {
                      if (!isCoach) return;
                      const newLineups = { ...lineups };
                      newLineups[activeTeam][index].position = e.target.value as Position;
                      setLineups(newLineups);
                    }}
                    disabled={!isCoach}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary
                      disabled:bg-gray-50 disabled:cursor-not-allowed text-base"
                  >
                    {Object.values(Position).map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>
                
                {/* Desktop layout */}
                <div className="col-span-1 font-medium hidden sm:block">{player.order}</div>
                <div className="col-span-4 hidden sm:block">
                  <div className="font-medium text-gray-800">{player.name}</div>
                  <div className="text-sm text-gray-500">#{player.jerseyNumber}</div>
                </div>
                <div className="col-span-3 hidden sm:block">
                  <select
                    value={player.position}
                    onChange={(e) => {
                      if (!isCoach) return;
                      const newLineups = { ...lineups };
                      newLineups[activeTeam][index].position = e.target.value as Position;
                      setLineups(newLineups);
                    }}
                    disabled={!isCoach}
                    className="w-full px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-brand-primary
                      disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    {Object.values(Position).map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 hidden sm:block">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    bg-green-100 text-green-800">
                    {player.status}
                  </span>
                </div>
                <div className="col-span-2 hidden sm:flex justify-end gap-1">
                  {isCoach && (
                    <>
                      <button
                        onClick={() => handleMovePlayer(player.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMovePlayer(player.id, 'down')}
                        disabled={index === currentLineup.length - 1}
                        className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemovePlayer(player.id)}
                        className="p-1 text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isCoach && currentLineup.length > 0 && (
        <div className="mt-6 flex justify-center sm:justify-end">
          <button
            onClick={handleSaveLineup}
            className="px-6 py-3 sm:py-2 bg-brand-primary text-white rounded-lg hover:opacity-90 transition-colors w-full sm:w-auto"
          >
            Save Changes
          </button>
        </div>
      )}

      {/* Add Team Player Dialog */}
      <Dialog open={showAddPlayerDialog} onClose={() => setShowAddPlayerDialog(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg shadow-xl p-5 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <Dialog.Title className="text-xl font-bold mb-4">
              Add Player to Lineup
            </Dialog.Title>

            <div className="space-y-4">
              {availablePlayers.length > 0 ? (
                availablePlayers.map(player => (
                  <button
                    key={player.id}
                    onClick={() => handleAddPlayer(player)}
                    className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100
                      transition-colors text-left"
                  >
                    <div className="w-full">
                      <div className="font-medium text-gray-800 truncate">{player.name}</div>
                      <div className="text-sm text-gray-500 truncate">
                        #{player.jerseyNumber} • {player.positions.join(', ')}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-center text-gray-500 py-6">
                  No available players to add
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowAddPlayerDialog(false)}
                className="px-5 py-2.5 text-gray-600 hover:text-gray-800 font-medium"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Add Generic Player Dialog */}
      <Dialog open={showAddGenericDialog} onClose={() => setShowAddGenericDialog(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg shadow-xl p-5 sm:p-6 w-full max-w-md">
            <Dialog.Title className="text-xl font-bold mb-4">
              Add Opponent Player
            </Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Player Name (Optional)
                </label>
                <input
                  type="text"
                  value={genericPlayer.name}
                  onChange={(e) => setGenericPlayer(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                  placeholder="Enter player name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jersey Number
                </label>
                <input
                  type="text"
                  value={genericPlayer.jerseyNumber}
                  onChange={(e) => setGenericPlayer(prev => ({ ...prev, jerseyNumber: e.target.value }))}
                  required
                  className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                  placeholder="Enter jersey number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <select
                  value={genericPlayer.position}
                  onChange={(e) => setGenericPlayer(prev => ({ 
                    ...prev, 
                    position: e.target.value as Position 
                  }))}
                  required
                  className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                >
                  {Object.values(Position).map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4">
              <button
                onClick={() => setShowAddGenericDialog(false)}
                className="px-4 py-2.5 text-gray-600 hover:text-gray-800 font-medium order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleAddGenericPlayer}
                className="px-4 py-2.5 bg-brand-primary text-white rounded-lg hover:opacity-90 order-1 sm:order-2"
              >
                Add Player
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};