import React from 'react';
import { Package } from 'lucide-react';
import { Drill } from '../types';

interface Props {
  drills: Drill[];
}

export const EquipmentList: React.FC<Props> = ({ drills }) => {
  // Get unique equipment across all drills
  const uniqueEquipment = Array.from(
    new Set(drills.flatMap(drill => drill.equipment))
  ).sort();

  if (uniqueEquipment.length === 0) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Package className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">Equipment Needed</h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {uniqueEquipment.map((item) => (
          <span
            key={item}
            className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 shadow-sm"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};