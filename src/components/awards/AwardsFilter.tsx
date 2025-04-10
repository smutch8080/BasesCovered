import React, { useState, useMemo } from 'react';
import { Filter } from 'lucide-react';
import { PracticeAward, AwardCategory } from '../../types';

interface Props {
  awards: PracticeAward[];
  onFilteredAwardsChange: (filteredAwards: PracticeAward[]) => void;
}

export const AwardsFilter: React.FC<Props> = ({ awards, onFilteredAwardsChange }) => {
  const [filters, setFilters] = useState({
    category: 'all',
    player: 'all',
    dateStart: '',
    dateEnd: ''
  });

  // Memoize players list
  const players = useMemo(() => 
    Array.from(new Set(awards.map(award => award.playerName))).sort(),
    [awards]
  );

  // Memoize filtered awards
  const applyFilters = () => {
    const filtered = awards.filter(award => {
      const matchesCategory = filters.category === 'all' || award.category === filters.category;
      const matchesPlayer = filters.player === 'all' || award.playerName === filters.player;
      const matchesDateRange = (!filters.dateStart || new Date(award.date) >= new Date(filters.dateStart)) &&
        (!filters.dateEnd || new Date(award.date) <= new Date(filters.dateEnd));

      return matchesCategory && matchesPlayer && matchesDateRange;
    });

    onFilteredAwardsChange(filtered);
  };

  // Update filters and trigger filtering
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Use setTimeout to ensure state is updated before filtering
    setTimeout(() => {
      applyFilters();
    }, 0);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-brand-primary" />
        <h2 className="text-lg font-semibold text-gray-800">Filter Awards</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
          >
            <option value="all">All Categories</option>
            {Object.values(AwardCategory).map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Player
          </label>
          <select
            value={filters.player}
            onChange={(e) => handleFilterChange('player', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
          >
            <option value="all">All Players</option>
            {players.map((player) => (
              <option key={player} value={player}>{player}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={filters.dateStart}
            onChange={(e) => handleFilterChange('dateStart', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={filters.dateEnd}
            onChange={(e) => handleFilterChange('dateEnd', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
          />
        </div>
      </div>
    </div>
  );
};