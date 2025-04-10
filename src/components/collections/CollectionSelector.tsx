import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Collection } from '../../types/collections';
import { useAuth } from '../../contexts/AuthContext';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedCollectionIds: string[];
  onCollectionsSelected: (collections: { id: string; name: string }[]) => void;
}

export const CollectionSelector: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedCollectionIds,
  onCollectionsSelected
}) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(selectedCollectionIds));
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadCollections = async () => {
      if (!currentUser) return;

      try {
        setIsLoading(true);
        const collectionsRef = collection(db, 'collections');
        const q = query(
          collectionsRef,
          where('userId', '==', currentUser.id),
          orderBy('updatedAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const loadedCollections: Collection[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          loadedCollections.push({
            ...data,
            id: doc.id,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          } as Collection);
        });

        setCollections(loadedCollections);
      } catch (error) {
        console.error('Error loading collections:', error);
        toast.error('Unable to load collections');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadCollections();
    }
  }, [currentUser, isOpen]);

  const handleSave = () => {
    const selectedCollections = collections
      .filter(collection => selectedIds.has(collection.id))
      .map(collection => ({
        id: collection.id,
        name: collection.title
      }));
    
    onCollectionsSelected(selectedCollections);
    onClose();
  };

  const filteredCollections = collections.filter(collection =>
    collection.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
          <Dialog.Title className="text-xl font-bold mb-4">
            Select Collections
          </Dialog.Title>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search collections..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading collections...</p>
            </div>
          ) : filteredCollections.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {filteredCollections.map((collection) => (
                  <label
                    key={collection.id}
                    className="flex items-center p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(collection.id)}
                      onChange={() => {
                        const newSelected = new Set(selectedIds);
                        if (newSelected.has(collection.id)) {
                          newSelected.delete(collection.id);
                        } else {
                          newSelected.add(collection.id);
                        }
                        setSelectedIds(newSelected);
                      }}
                      className="rounded text-brand-primary focus:ring-brand-primary mr-3"
                    />
                    <div>
                      <div className="font-medium">{collection.title}</div>
                      <div className="text-sm text-gray-500">
                        {collection.practicePlans.length} practice plans
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No collections found
            </div>
          )}

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90"
            >
              Add Selected Collections
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};