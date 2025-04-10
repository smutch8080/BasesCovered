import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { CoachingService } from '../../types/coach';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  coachName: string;
  coachId: string;
  service: CoachingService;
}

export const BookServiceDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  coachName,
  coachId,
  service
}) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setIsLoading(true);
      const bookingData = {
        coachId,
        userId: currentUser.id,
        userName: currentUser.displayName,
        serviceType: service.type,
        message: message.trim(),
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, 'booking_requests'), bookingData);
      toast.success('Booking request sent successfully');
      onClose();
    } catch (error) {
      console.error('Error sending booking request:', error);
      toast.error('Failed to send booking request');
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
            Book {service.type} Lesson with {coachName}
          </Dialog.Title>

          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="font-medium text-gray-800">${service.price} per session</p>
              <p className="text-gray-600">{service.duration} minutes</p>
              <p className="text-sm text-gray-500 mt-2">
                Available: {service.availability}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message to Coach
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                placeholder="Introduce yourself and let the coach know what you'd like to work on..."
              />
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
                disabled={isLoading}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};