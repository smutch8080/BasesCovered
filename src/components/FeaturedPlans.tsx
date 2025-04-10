import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SavedPracticePlan } from '../types';
import { Calendar, Clock, MapPin, Trophy, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const FeaturedPlans: React.FC = () => {
  const [plans, setPlans] = useState<SavedPracticePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadFeaturedPlans = async () => {
      try {
        setIsLoading(true);
        const plansRef = collection(db, 'practice_plans');
        const q = query(
          plansRef,
          where('featured', '==', true),
          orderBy('updatedAt', 'desc'),
          limit(3)
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
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedPlans();
  }, []);

  const handleViewPlan = async (plan: SavedPracticePlan) => {
    try {
      navigate('/practice-plan', { state: { plan } });
    } catch (error) {
      console.error('Error loading plan:', error);
      toast.error('Unable to load practice plan');
    }
  };

  if (isLoading || plans.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-brand-primary" />
          <h2 className="text-2xl font-bold text-gray-800">Featured Practice Plans</h2>
        </div>
        <Link
          to="/featured-plans"
          className="flex items-center gap-1 text-brand-primary hover:opacity-90"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="relative overflow-hidden rounded-lg shadow-lg group cursor-pointer"
            onClick={() => handleViewPlan(plan)}
          >
            <div className="absolute inset-0 bg-brand-gradient opacity-90" />
            <div className="relative p-6 text-white">
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              
              {plan.description && (
                <p className="text-white/90 mb-4 line-clamp-2">{plan.description}</p>
              )}
              
              <div className="space-y-2 text-white/90">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(plan.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{plan.duration} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{plan.location || 'No location set'}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/20">
                <span className="text-sm font-medium">
                  {plan.drills.length} drills
                </span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};