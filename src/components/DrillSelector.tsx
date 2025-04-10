import React from 'react';
import { useStore } from '../store';
import { DrillCard } from './DrillCard';
import { CategoryFilter } from './CategoryFilter';
import { Drill } from '../types';

interface Props {
  selectedDrills?: Drill[];
  onDrillsChange?: (drills: Drill[]) => void;
}

export const DrillSelector: React.FC<Props> = ({ selectedDrills, onDrillsChange }) => {
  const { drills, selectedCategory, setSelectedCategory, currentPlan } = useStore();

  const filteredDrills = selectedCategory
    ? drills.filter(drill => drill.category === selectedCategory)
    : drills;

  const isDrillSelected = (drillId: string) => {
    if (selectedDrills) {
      return selectedDrills.some(d => d.id === drillId);
    }
    return currentPlan?.drills.some(d => d.id === drillId) || false;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] p-6 rounded-lg">
        <CategoryFilter onSelect={setSelectedCategory} />
      </div>
      
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
    </div>
  );
};

// Also export as default for backward compatibility
export default DrillSelector;