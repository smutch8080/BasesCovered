import React from 'react';
import { Dialog } from '@headlessui/react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  planName: string;
}

export const DeletePlanDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  planName
}) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <Dialog.Title className="text-xl font-bold text-gray-800">
                Delete Practice Plan
              </Dialog.Title>
              <p className="text-gray-600 mt-1">
                Are you sure you want to delete "{planName}"?
              </p>
            </div>
          </div>

          <p className="text-gray-600 mb-6">
            This action cannot be undone. The practice plan will be permanently deleted.
          </p>

          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete Plan
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};