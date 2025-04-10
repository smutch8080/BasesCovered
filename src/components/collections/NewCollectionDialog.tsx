import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Collection } from '../../types/collections';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCollectionCreated: (collection: Collection) => void;
}

export const NewCollectionDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  onCollectionCreated
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [featured, setFeatured] = useState(false);
  const { currentUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const collectionData = {
        title,
        description,
        featured: currentUser.role === 'admin' ? featured : false,
        userId: currentUser.id,
        practicePlans: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'collections'), collectionData);
      
      const newCollection: Collection = {
        ...collectionData,
        id: docRef.id,
        practicePlans: [],
        createdAt: collectionData.createdAt.toDate(),
        updatedAt: collectionData.updatedAt.toDate()
      };

      onCollectionCreated(newCollection);
      onClose();
      
      // Reset form
      setTitle('');
      setDescription('');
      setFeatured(false);
    } catch (error) {
      console.error('Error creating collection:', error);
      toast.error('Failed to create collection');
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <Dialog.Title className="text-xl font-bold mb-4">
            Create New Collection
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                placeholder="Enter collection title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                placeholder="Enter collection description"
              />
            </div>

            {currentUser?.role === 'admin' && (
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="text-sm text-gray-700">
                    Feature this collection
                  </span>
                </label>
              </div>
            )}

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
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90"
              >
                Create Collection
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};