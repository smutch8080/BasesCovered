import React from 'react';
import { Dialog } from '@headlessui/react';
import { Player } from '../../types/team';
import { UserCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  player: Player | null;
}

export const PlayerViewDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  player
}) => {
  if (!player) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <UserCircle className="w-10 h-10 text-gray-400" />
            </div>
            <div>
              <Dialog.Title className="text-xl font-bold text-gray-800">
                {player.name}
              </Dialog.Title>
              <p className="text-gray-600">#{player.jerseyNumber}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Age</h3>
              <p className="text-gray-900">{player.age} years old</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Positions</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {player.positions.map((position) => (
                  <span
                    key={position}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                  >
                    {position}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};