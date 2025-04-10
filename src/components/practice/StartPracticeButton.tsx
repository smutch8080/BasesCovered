import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Play } from 'lucide-react';
import { PracticeTimer } from './PracticeTimer';
import { PracticePlan } from '../../types';

interface Props {
  plan: PracticePlan;
}

export const StartPracticeButton: React.FC<Props> = ({ plan }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleComplete = () => {
    // Handle practice completion
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg
          hover:bg-green-700 transition-colors"
      >
        <Play className="w-4 h-4" />
        Start Practice
      </button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
            <Dialog.Title className="text-xl font-bold text-gray-800 mb-6">
              Practice Timer - {plan.teamName}
            </Dialog.Title>

            <PracticeTimer
              drills={plan.drills}
              warmup={plan.warmup}
              onComplete={handleComplete}
            />

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};