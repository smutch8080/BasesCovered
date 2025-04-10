import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useStore } from '../store';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  playerId?: string;
  playerName?: string;
  teamId?: string;
}

export const SaveNewPlanDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  playerId,
  playerName,
  teamId
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();
  const { currentPlan, savePlan } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentPlan) return;

    try {
      console.log('Starting plan save in dialog:', {
        name,
        description,
        isPlayerPlan: !!playerId,
        playerName,
        teamId,
        currentUser: {
          id: currentUser.id,
          role: currentUser.role
        }
      });

      setIsLoading(true);

      // Validate required fields
      if (!name.trim()) {
        console.log('Validation failed: Empty plan name');
        toast.error('Please enter a plan name');
        return;
      }

      // For team plans, only pass teamId
      // For player plans, include player details
      if (playerId && playerName) {
        await savePlan(
          name.trim(),
          currentUser.id,
          false,
          playerId,
          playerName,
          description.trim(),
          currentPlan.notes?.trim(),
          currentPlan.awards,
          teamId
        );
      } else {
        await savePlan(
          name.trim(),
          currentUser.id,
          false,
          undefined,
          undefined,
          description.trim(),
          currentPlan.notes?.trim(),
          currentPlan.awards,
          teamId
        );
      }

      console.log('Plan saved successfully');
      onClose();
      
      // Reset form
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Error in dialog while saving plan:', {
        error,
        errorCode: error.code,
        errorMessage: error.message,
        errorStack: error.stack
      });
      toast.error('Failed to save practice plan');
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
            Save New Practice Plan
            {playerName && (
              <span className="block text-sm text-gray-600 mt-1">
                for {playerName}
              </span>
            )}
          </Dialog.Title>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                placeholder="Enter plan name"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                placeholder="Enter plan description"
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save Plan'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};