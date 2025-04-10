import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { Player, Position } from '../../types/team';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  player: Player | null;
  onPlayerUpdated: (player: Player) => void;
  isProcessing?: boolean;
}

export const EditPlayerDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  player,
  onPlayerUpdated,
  isProcessing = false
}) => {
  const [name, setName] = useState(player?.name || '');
  const [jerseyNumber, setJerseyNumber] = useState(player?.jerseyNumber || '');
  const [age, setAge] = useState(player?.age || 0);
  const [positions, setPositions] = useState<Position[]>(player?.positions || []);

  useEffect(() => {
    if (player) {
      setName(player.name);
      setJerseyNumber(player.jerseyNumber);
      setAge(player.age);
      setPositions(player.positions);
    }
  }, [player]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!player) return;

    onPlayerUpdated({
      ...player,
      name,
      jerseyNumber,
      age,
      positions
    });
  };

  const togglePosition = (position: Position) => {
    setPositions(prev =>
      prev.includes(position)
        ? prev.filter(p => p !== position)
        : [...prev, position]
    );
  };

  if (!player) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <Dialog.Title className="text-xl font-bold mb-4">
            Edit Player
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Player Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                placeholder="Enter player name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jersey Number
              </label>
              <input
                type="text"
                value={jerseyNumber}
                onChange={(e) => setJerseyNumber(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                placeholder="Enter jersey number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value))}
                required
                min="4"
                max="18"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                placeholder="Enter age"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Positions
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(Position).map((position) => (
                  <label
                    key={position}
                    className="flex items-center gap-2 p-2 border rounded cursor-pointer
                      hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={positions.includes(position)}
                      onChange={() => togglePosition(position)}
                      className="rounded text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="text-sm">{position}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                disabled={isProcessing}
              >
                {isProcessing ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};