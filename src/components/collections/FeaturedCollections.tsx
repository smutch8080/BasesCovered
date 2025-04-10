import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Collection } from '../../types/collections';
import { Folder, ChevronRight } from 'lucide-react';

export const FeaturedCollections: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadFeaturedCollections = async () => {
      try {
        setIsLoading(true);
        const collectionsRef = collection(db, 'collections');
        const q = query(
          collectionsRef,
          where('featured', '==', true),
          orderBy('updatedAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const loadedCollections: Collection[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data) {
            loadedCollections.push({
              ...data,
              id: doc.id,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
              practicePlans: data.practicePlans || []
            } as Collection);
          }
        });

        setCollections(loadedCollections);
      } catch (error) {
        console.error('Error loading featured collections:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedCollections();
  }, []);

  if (isLoading || collections.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Folder className="w-6 h-6 text-brand-primary" />
          <h2 className="text-2xl font-bold text-gray-800">Featured Collections</h2>
        </div>
        <Link
          to="/collections"
          className="flex items-center gap-1 text-brand-primary hover:opacity-90"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((collection) => (
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
          </Link>
        ))}
      </div>
    </div>
  );
};