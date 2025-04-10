import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Folder, Plus, Search } from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Collection } from '../types/collections';
import { DrillCategory } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { NewCollectionDialog } from '../components/collections/NewCollectionDialog';
import toast from 'react-hot-toast';

function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DrillCategory | ''>('');
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

    loadCollections();
  }, [currentUser]);

  const filteredCollections = collections.filter(collection => {
    const matchesSearch = collection.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collection.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFeatured = !filterFeatured || collection.featured;
    const matchesCategory = !selectedCategory || collection.practicePlans.some(plan => {
      const planDoc = collection(db, 'practice_plans').doc(plan.id);
      return planDoc.get().then(doc => {
        const planData = doc.data();
        return planData?.drills.some((drill: any) => drill.category === selectedCategory);
      });
    });
    return matchesSearch && matchesFeatured && matchesCategory;
  });

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Please sign in to view collections.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Folder className="w-8 h-8 text-brand-primary" />
          <h1 className="text-3xl font-bold text-gray-800">My Collections</h1>
        </div>

        <button
          onClick={() => setShowNewDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
            hover:opacity-90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Collection
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search collections..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div className="md:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as DrillCategory | '')}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            >
              <option value="">All Categories</option>
              {Object.values(DrillCategory).map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="md:w-48">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filterFeatured}
                onChange={(e) => setFilterFeatured(e.target.checked)}
                className="rounded text-brand-primary focus:ring-brand-primary"
              />
              <span className="text-gray-700">Featured Only</span>
            </label>
          </div>
        </div>
      </div>

      {isLoading ? (
        <p className="text-center text-gray-600">Loading collections...</p>
      ) : filteredCollections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollections.map((collection) => (
            <Link
              key={collection.id}
              to={`/collections/${collection.id}`}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {collection.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {collection.description}
              </p>
              <div className="text-sm text-gray-500">
                {collection.practicePlans.length} practice plans
              </div>
              {collection.featured && (
                <span className="mt-2 inline-block px-2 py-1 text-xs bg-brand-gradient text-white rounded-full">
                  Featured
                </span>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Collections Yet</h2>
          <p className="text-gray-600 mb-6">
            Start by creating your first collection to organize your practice plans.
          </p>
          <button
            onClick={() => setShowNewDialog(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-lg
              hover:opacity-90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Your First Collection
          </button>
        </div>
      )}

      <NewCollectionDialog
        isOpen={showNewDialog}
        onClose={() => setShowNewDialog(false)}
        onCollectionCreated={(newCollection) => {
          setCollections(prev => [newCollection, ...prev]);
          toast.success('Collection created successfully');
        }}
      />
    </div>
  );
}

export default CollectionsPage;