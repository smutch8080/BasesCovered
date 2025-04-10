import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { doc, updateDoc, arrayUnion, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  onCoachAdded: () => void;
}

export const AddCoachDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  teamId,
  onCoachAdded
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      // Find user by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email.toLowerCase().trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error('No user found with this email address');
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      // Verify user is a coach
      if (userData.role !== 'coach' && userData.role !== 'admin') {
        toast.error('User must be a coach to be added to the team');
        return;
      }

      // Update team with new coach
      const teamRef = doc(db, 'teams', teamId);
      await updateDoc(teamRef, {
        coaches: arrayUnion(userDoc.id),
        updatedAt: new Date()
      });

      // Update user's teams array
      const userRef = doc(db, 'users', userDoc.id);
      await updateDoc(userRef, {
        teams: arrayUnion(teamId)
      });

      onCoachAdded();
      onClose();
      toast.success('Coach added successfully');
      setEmail('');
    } catch (error) {
      console.error('Error adding coach:', error);
      toast.error('Failed to add coach');
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
            Add Coach
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coach Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                placeholder="Enter coach's email"
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
                {isLoading ? 'Adding...' : 'Add Coach'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};