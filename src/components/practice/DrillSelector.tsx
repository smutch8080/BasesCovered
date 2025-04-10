import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { DrillCard } from '../DrillCard';
import { CategoryFilter } from '../CategoryFilter';
import { Drill, DrillCategory } from '../../types';
import { Plus, Star, BookOpen } from 'lucide-react';
import { NewCustomDrillDialog } from './NewCustomDrillDialog';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface Props {
  selectedDrills?: Drill[];
  onDrillsChange?: (drills: Drill[]) => void;
}

export const DrillSelector: React.FC<Props> = ({ selectedDrills, onDrillsChange }) => {
  const { drills, selectedCategory, setSelectedCategory, currentPlan, favoriteDrills } = useStore();
  const [showNewDrillDialog, setShowNewDrillDialog] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [customDrills, setCustomDrills] = useState<Drill[]>([]);
  const [showCustomDrills, setShowCustomDrills] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadCustomDrills = async () => {
      if (!currentUser) return;

      try {
        const drillsRef = collection(db, 'drills');
        const q = query(
          drillsRef,
          where('createdBy', '==', currentUser.id),
          where('isCustom', '==', true)
        );
        
        const querySnapshot = await getDocs(q);
        const loadedDrills: Drill[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          loadedDrills.push({
            ...data,
            id: doc.id,
            comments: data.comments || [],
            votes: data.votes || 0,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate()
          } as Drill);
        });

        setCustomDrills(loadedDrills);
      } catch (error) {
        console.error('Error loading custom drills:', error);
      }
    };

    loadCustomDrills();
  }, [currentUser]);

  const filteredDrills = (showCustomDrills ? customDrills : drills).filter(drill => {
    const matchesCategory = selectedCategory
      ? drill.category === selectedCategory
      : true;

    const matchesFavorites = showFavoritesOnly
      ? favoriteDrills.has(drill.id)
      : true;

    return matchesCategory && matchesFavorites;
  });

  const isDrillSelected = (drillId: string) => {
    if (selectedDrills) {
      return selectedDrills.some(d => d.id === drillId);
    }
    return currentPlan?.drills.some(d => d.id === drillId) || false;
  };

  const handleNewDrillCreated = (newDrill: Drill) => {
    setCustomDrills(prev => [newDrill, ...prev]);
    setShowCustomDrills(true);
    setShowNewDrillDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">Available Drills</h2>
          <div className="flex gap-4">
            {currentUser && (
              <>
                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    showFavoritesOnly 
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Star className="w-4 h-4" fill={showFavoritesOnly ? 'currentColor' : 'none'} />
                  <span className="hidden md:inline">
                    {showFavoritesOnly ? 'Show All' : 'Show Favorites'}
                  </span>
                </button>
                <button
                  onClick={() => setShowCustomDrills(!showCustomDrills)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    showCustomDrills 
                      ? 'bg-brand-accent text-white hover:opacity-90'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden md:inline">
                    {showCustomDrills ? 'Show Library' : 'My Drills'}
                  </span>
                </button>
              </>
            )}
            <button
              onClick={() => setShowNewDrillDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-brand-primary rounded-lg
                hover:bg-opacity-90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Custom Drill
            </button>
          </div>
        </div>
        <CategoryFilter onSelect={setSelectedCategory} />
      </div>
      
      {showFavoritesOnly && favoriteDrills.size === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow-md">
          <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Favorite Drills</h3>
          <p className="text-gray-600">
            Click the star icon on any drill to add it to your favorites
          </p>
        </div>
      ) : showCustomDrills && customDrills.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow-md">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Custom Drills</h3>
          <p className="text-gray-600">
            Create your first custom drill by clicking the "Add Custom Drill" button
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDrills.map(drill => (
            <DrillCard
              key={drill.id}
              drill={drill}
              inPlan={isDrillSelected(drill.id)}
            />
          ))}
          {filteredDrills.length === 0 && (
            <p className="text-center text-gray-500 col-span-2 py-4">
              No drills found for this category
            </p>
          )}
        </div>
      )}

      <NewCustomDrillDialog
        isOpen={showNewDrillDialog}
        onClose={() => setShowNewDrillDialog(false)}
        onDrillCreated={handleNewDrillCreated}
      />
    </div>
  );
};

// Also export as default for backward compatibility
export default DrillSelector;