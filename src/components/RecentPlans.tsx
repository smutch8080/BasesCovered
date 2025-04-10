import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, ExternalLink } from 'lucide-react';
import { useStore } from '../store';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const RecentPlans: React.FC = () => {
  const { savedPlans, loadPlan, loadSavedPlans } = useStore();
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPlans = async () => {
      if (currentUser) {
        try {
          setIsLoading(true);
          await loadSavedPlans(currentUser.id);
        } catch (error) {
          console.error('Error loading recent plans:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadPlans();
  }, [currentUser, loadSavedPlans]);

  const handleViewPlan = (plan: any) => {
    loadPlan(plan);
    navigate('/practice-plan');
  };

  if (!currentUser) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p className="text-center text-gray-600">Loading recent plans...</p>
      </div>
    );
  }

  const recentPlans = savedPlans.slice(0, 3);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Recent Practice Plans</h2>
        <Link
          to="/saved-plans"
          className="text-brand-primary hover:opacity-90 flex items-center gap-2"
        >
          View All
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-4">
        {recentPlans.map((plan) => (
          <div
            key={plan.id}
            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-800">{plan.name}</h3>
              <button
                onClick={() => handleViewPlan(plan)}
                className="text-brand-primary hover:opacity-90"
              >
                View Plan
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(plan.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{plan.duration} min</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{plan.location || 'No location'}</span>
              </div>
            </div>
          </div>
        ))}

        {!isLoading && recentPlans.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            No saved practice plans yet. Create your first plan!
          </p>
        )}
      </div>
    </div>
  );
};