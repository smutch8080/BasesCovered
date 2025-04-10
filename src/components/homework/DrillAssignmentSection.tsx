import React, { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { Drill } from '../../types';
import { DrillSelector } from '../practice/DrillSelector';

interface Props {
  drills: Drill[];
  onDrillsChange: (drills: Drill[]) => void;
}

export const DrillAssignmentSection: React.FC<Props> = ({ drills, onDrillsChange }) => {
  const [showDrillSelector, setShowDrillSelector] = useState(false);

  const handleRemoveDrill = (drillId: string) => {
    onDrillsChange(drills.filter(d => d.id !== drillId));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Assigned Drills</h3>
        <button
          type="button"
          onClick={() => setShowDrillSelector(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
            hover:opacity-90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Drills
        </button>
      </div>

      {drills.length > 0 ? (
        <div className="space-y-3">
          {drills.map((drill) => (
            <div
              key={drill.id}
              className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <h4 className="font-medium text-gray-800">{drill.name}</h4>
                <p className="text-sm text-gray-600">{drill.shortDescription}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-1 bg-gray-200 rounded-full">
                    {drill.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {drill.duration} minutes
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveDrill(drill.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-4">
          No drills assigned yet
        </p>
      )}

      {showDrillSelector && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Select Drills</h2>
              <button
                type="button"
                onClick={() => setShowDrillSelector(false)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <DrillSelector
              selectedDrills={drills}
              onDrillsChange={onDrillsChange}
            />
            
            <div className="flex justify-end mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowDrillSelector(false)}
                className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};