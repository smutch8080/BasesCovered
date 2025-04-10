import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SavedPracticePlan } from '../types';
import { DrillCategory } from '../types';
import { Search, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

function FeaturedPlansPage() {
  const [plans, setPlans] = useState<SavedPracticePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DrillCategory | ''>('');

  useEffect(() => {
    const loadFeaturedPlans = async () => {
      try {
        setIsLoading(true);
        const plansRef = collection(db, 'practice_plans');
        const q = query(
          plansRef,
          where('featured', '==', true),
          orderBy('updatedAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const loadedPlans: SavedPracticePlan[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          loadedPlans.push({
            ...data,
            id: doc.id,
            date: data.date.toDate(),
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          } as SavedPracticePlan);
        });

        setPlans(loadedPlans);
      } catch (error) {
        console.error('Error loading featured plans:', error);
        toast.error('Unable to load featured plans');
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedPlans();
  }, []);

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plan.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesCategory = !selectedCategory || plan.drills.some(drill => drill.category === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="w-8 h-8 text-brand-primary" />
        <h1 className="text-3xl font-bold text-gray-800">Featured Practice Plans</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search plans..."
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
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading featured plans...</p>
        </div>
      ) : filteredPlans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <Link
              key={plan.id}
              to={`/practice-plan/${plan.id}`}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{plan.name}</h3>
              {plan.description && (
                <p className="text-gray-600 mb-4 line-clamp-3">{plan.description}</p>
              )}
              <p className="text-gray-600 mb-2">Team: {plan.teamName}</p>
              <p className="text-gray-500 text-sm">
                Created: {new Date(plan.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {plan.drills.slice(0, 3).map((drill) => (
                  <span
                    key={drill.id}
                    className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
                  >
                    {drill.category}
                  </span>
                ))}
                {plan.drills.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                    +{plan.drills.length - 3} more
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">No featured plans found</p>
        </div>
      )}
    </div>
  );
}

export default FeaturedPlansPage;