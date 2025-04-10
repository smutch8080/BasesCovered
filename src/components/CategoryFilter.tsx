import React from 'react';
import { useStore } from '../store';
import { DrillCategory } from '../types';
import { 
  Target, Shield, CircleDot, 
  Radar, Crosshair, Boxes,
  Zap, Wind, Footprints,
  Users, Brain, LayoutGrid
} from 'lucide-react';

interface Props {
  onSelect?: (category: DrillCategory | null) => void;
}

const categories: { type: DrillCategory | 'All'; icon: React.ReactNode }[] = [
  { type: 'All', icon: <LayoutGrid className="w-5 h-5" /> },
  { type: DrillCategory.Hitting, icon: <Target className="w-5 h-5" /> },
  { type: DrillCategory.Fielding, icon: <Shield className="w-5 h-5" /> },
  { type: DrillCategory.Bunting, icon: <CircleDot className="w-5 h-5" /> },
  { type: DrillCategory.Outfield, icon: <Radar className="w-5 h-5" /> },
  { type: DrillCategory.Pitching, icon: <Crosshair className="w-5 h-5" /> },
  { type: DrillCategory.Catching, icon: <Boxes className="w-5 h-5" /> },
  { type: DrillCategory.Agility, icon: <Zap className="w-5 h-5" /> },
  { type: DrillCategory.Speed, icon: <Wind className="w-5 h-5" /> },
  { type: DrillCategory.BaseRunning, icon: <Footprints className="w-5 h-5" /> },
  { type: DrillCategory.TeamBuilding, icon: <Users className="w-5 h-5" /> },
  { type: DrillCategory.GameKnowledge, icon: <Brain className="w-5 h-5" /> }
];

export const CategoryFilter: React.FC<Props> = ({ onSelect }) => {
  const { selectedCategory, setSelectedCategory } = useStore();

  const handleSelect = (type: DrillCategory | 'All') => {
    const category = type === 'All' ? null : type as DrillCategory;
    if (onSelect) {
      onSelect(category);
    } else {
      setSelectedCategory(category);
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {categories.map(({ type, icon }) => (
        <button
          key={type}
          onClick={() => handleSelect(type)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all
            ${(type === 'All' && !selectedCategory) || selectedCategory === type
              ? 'bg-white text-brand-primary shadow-sm'
              : 'bg-white/10 text-white hover:bg-white/20'
            }`}
        >
          {icon}
          <span>{type}</span>
        </button>
      ))}
    </div>
  );
};