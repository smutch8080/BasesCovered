import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { useStore } from '../store';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  playerId?: string;
  playerName?: string;
  teamId?: string;
}

export const SavePlanDialog: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  playerId, 
  playerName,
  teamId
}) => {
  const [name, setName] = useState('');
  const [featured, setFeatured] = useState(false);
  const [description, setDescription] = useState('');
  const [isSaveAsNew, setSaveAsNew] = useState(false);
  const { currentPlan, savePlan } = useStore();
  const { currentUser } = useAuth();

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setFeatured(false);
      setDescription('');
      setSaveAsNew(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentPlan) return;

    try {
      if (isSaveAsNew) {
        // Save as new plan
        await savePlan(
          name, 
          currentUser.id, 
          featured, 
          playerId, 
          playerName, 
          description,
          currentPlan.notes,
          currentPlan.awards,
          teamId
        );
        toast.success('New practice plan saved');
      } else if (currentPlan.id) {
        // Update existing plan
        const planRef = doc(db, 'practice_plans', currentPlan.id);
        await updateDoc(planRef, {
          ...currentPlan,
          updatedAt: Timestamp.now()
        });
        toast.success('Practice plan updated');
      }
      onClose();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error('Failed to save practice plan');
    }
  };

  const isAdmin = currentUser?.role === 'admin';
  const isExistingPlan = Boolean(currentPlan?.id);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <Dialog.Title className="text-xl font-bold mb-4">
            {isExistingPlan ? 'Save Practice Plan' : 'Save New Plan'}
            {playerName && (
              <span className="block text-sm text-gray-600 mt-1">
                for {playerName}
              </span>
            )}
          </Dialog.Title>

          <form onSubmit={handleSubmit}>
            {(isSaveAsNew || !isExistingPlan) && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isSaveAsNew || !isExistingPlan}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                  placeholder="Enter plan name"
                />
              </div>
            )}

            {isAdmin && (isSaveAsNew || !isExistingPlan) && (
              <>
                <div className="mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="rounded text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="text-sm text-gray-700">
                      Feature this practice plan
                    </span>
                  </label>
                </div>

                {featured && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required={featured}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                      placeholder="Enter a description for this featured plan"
                    />
                  </div>
                )}
              </>
            )}

            {isExistingPlan && !isSaveAsNew && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setSaveAsNew(true)}
                  className="text-brand-primary hover:underline"
                >
                  Save as new plan instead?
                </button>
              </div>
            )}

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
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90"
              >
                {isExistingPlan && !isSaveAsNew ? 'Update Plan' : 'Save Plan'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};