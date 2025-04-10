import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search, Plus, Star } from 'lucide-react';
import { CategoryFilter } from '../components/CategoryFilter';
import DrillCard from '../components/DrillCard';
import { useStore } from '../store';
import { useAuth } from '../contexts/AuthContext';
import { DrillCategory } from '../types';
import { PageLayout } from '../components/layout/PageLayout';

export default function DrillsPage() {
  const location = useLocation();
  const { searchTerm: initialSearchTerm, category: initialCategory } = location.state || {};
  const { drills, loadDrills, loadFavoriteDrills, favoriteDrills } = useStore();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm || '');
  const [selectedCategory, setSelectedCategory] = useState<DrillCategory | null>(initialCategory || null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    loadDrills();
    if (currentUser) {
      loadFavoriteDrills();
    }
  }, [loadDrills, loadFavoriteDrills, currentUser]);

  // Filter drills based on search term, category, and favorites
  const filteredDrills = drills?.filter(drill => {
    const matchesSearch = searchTerm
      ? drill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drill.shortDescription.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesCategory = selectedCategory
      ? drill.category === selectedCategory
      : true;

    const matchesFavorites = showFavoritesOnly
      ? favoriteDrills.has(drill.id)
      : true;

    return matchesSearch && matchesCategory && matchesFavorites;
  }) || [];

  const isAdmin = currentUser?.role === 'admin';

  return (
    <PageLayout className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Browse Drills</h1>
          {isAdmin && (
            <Link
              to="/add-drill"
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
                hover:opacity-90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Drill
            </Link>
          )}
        </div>

        <div className="bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end rounded-lg p-6 mb-8">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search drills..."
                  className="w-full pl-10 pr-4 py-2 bg-white text-gray-800 border-0 rounded-lg focus:ring-2 focus:ring-white/50 placeholder-gray-500"
                />
              </div>
              {currentUser && (
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
              )}
            </div>
            <div className="flex justify-center">
              <CategoryFilter onSelect={setSelectedCategory} />
            </div>
          </div>
        </div>

        {showFavoritesOnly && favoriteDrills.size === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No Favorite Drills</h2>
            <p className="text-gray-600 mb-6">
              Click the star icon on any drill to add it to your favorites
            </p>
          </div>
        ) : filteredDrills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDrills.map(drill => (
              <DrillCard
                key={drill.id}
                drill={drill}
                inPlan={false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600">No drills found matching your criteria</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}