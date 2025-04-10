import React from 'react';
import { LessonCategory } from '../../types/lessons';

interface Props {
  selectedCategory: LessonCategory | 'all';
  onCategoryChange: (category: LessonCategory | 'all') => void;
}

export const CategoryFilter: React.FC<Props> = ({ selectedCategory, onCategoryChange }) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <button
        onClick={() => onCategoryChange('all')}
        className={`px-4 py-2 rounded-lg transition-colors ${
          selectedCategory === 'all'
            ? 'bg-brand-primary text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        All Categories
      </button>
      {Object.values(LessonCategory).map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedCategory === category
              ? 'bg-brand-primary text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};