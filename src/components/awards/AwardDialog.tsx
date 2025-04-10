import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { doc, addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { awards } from '../../data/awards';
import { AwardCategory } from '../../types';
import { sendAwardNotification } from '../../services/notifications/events';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  players: {
    id: string;
    name: string;
    jerseyNumber: string;
  }[];
  onAwardGiven: (award: any) => void;
}

export const AwardDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  teamId,
  players,
  onAwardGiven
}) => {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof awards | ''>('');
  const [selectedAward, setSelectedAward] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !selectedAward || !selectedPlayer) return;

    try {
      setIsLoading(true);
      const player = players.find(p => p.id === selectedPlayer);
      if (!player) throw new Error('Selected player not found');

      const award = awards[selectedCategory].find(a => a.id === selectedAward);
      if (!award) throw new Error('Award not found');

      const now = new Date();
      const awardData = {
        teamId,
        playerId: player.id,
        playerName: player.name,
        category: selectedCategory as AwardCategory,
        type: award.name,
        description: award.description,
        date: now,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(collection(db, 'team_awards'), {
        ...awardData,
        date: Timestamp.fromDate(awardData.date),
        createdAt: Timestamp.fromDate(awardData.createdAt),
        updatedAt: Timestamp.fromDate(awardData.updatedAt)
      });

      // Send award notification
      await sendAwardNotification(
        player.id,
        player.email,
        player.name,
        award.name,
        teamId
      );

      onAwardGiven({
        id: docRef.id,
        ...awardData
      });
      
      onClose();
      toast.success('Award given successfully');

      // Reset form
      setSelectedCategory('');
      setSelectedAward('');
      setSelectedPlayer('');
    } catch (error) {
      console.error('Error giving award:', error);
      toast.error('Failed to give award');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <Dialog.Title className="text-xl font-bold mb-4">
            Give Award
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value as keyof typeof awards);
                  setSelectedAward('');
                }}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              >
                <option value="">Select category...</option>
                {Object.keys(awards).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {selectedCategory && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Award
                </label>
                <select
                  value={selectedAward}
                  onChange={(e) => setSelectedAward(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="">Select award...</option>
                  {awards[selectedCategory].map((award) => (
                    <option key={award.id} value={award.id}>
                      {award.name}
                    </option>
                  ))}
                </select>
                {selectedAward && (
                  <p className="mt-1 text-sm text-gray-500">
                    {awards[selectedCategory].find(a => a.id === selectedAward)?.description}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Player
              </label>
              <select
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              >
                <option value="">Select player...</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name} (#{player.jerseyNumber})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !selectedCategory || !selectedAward || !selectedPlayer}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Giving Award...' : 'Give Award'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};