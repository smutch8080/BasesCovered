import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { SavedPracticePlan } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  plan: SavedPracticePlan;
}

export const DuplicatePlanDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  plan
}) => {
  const [name, setName] = useState(`${plan.name} (Copy)`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(name);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <Dialog.Title className="text-xl font-bold mb-4">
            Duplicate Practice Plan
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
                Duplicate
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};