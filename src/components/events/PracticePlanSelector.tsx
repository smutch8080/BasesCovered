import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dialog } from '@headlessui/react';
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { SavedPracticePlan } from '../../types';
import { Event } from '../../types/events';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  onEventUpdated: (event: Event) => void;
}

export const PracticePlanSelector: React.FC<Props> = ({
  isOpen,
  onClose,
  event,
  onEventUpdated
}) => {
  const [plans, setPlans] = useState<SavedPracticePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadPlans = async () => {
      if (!currentUser) return;

      try {
        setIsLoading(true);
        const plansRef = collection(db, 'practice_plans');
        const q = query(
          plansRef,
          where('userId', '==', currentUser.id),
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
        console.error('Error loading practice plans:', error);
        toast.error('Unable to load practice plans');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadPlans();
    }
  }, [currentUser, isOpen]);

  const handleSelectPlan = async (plan: SavedPracticePlan) => {
    try {
      const eventRef = doc(db, 'events', event.id);
      await updateDoc(eventRef, {
        practicePlanId: plan.id,
        practicePlanName: plan.name,
        updatedAt: new Date()
      });

      onEventUpdated({
        ...event,
        practicePlanId: plan.id,
        practicePlanName: plan.name,
        updatedAt: new Date()
      });

      onClose();
      toast.success('Practice plan attached successfully');
    } catch (error) {
      console.error('Error attaching practice plan:', error);
      toast.error('Failed to attach practice plan');
    }
  };

  const handleCreateNew = () => {
    onClose();
    navigate('/practice-plan');
  };

  const filteredPlans = plans.filter(plan => 
    plan.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
          <Dialog.Title className="text-xl font-bold mb-4">
            Select Practice Plan
          </Dialog.Title>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search practice plans..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading practice plans...</p>
            </div>
          ) : filteredPlans.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {filteredPlans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => handleSelectPlan(plan)}
                    className="w-full flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <div className="font-medium text-left">{plan.name}</div>
                      <div className="text-sm text-gray-500 text-left">
                        Created: {new Date(plan.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {plan.id === event.practicePlanId && (
                      <span className="text-brand-primary">Currently Selected</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No practice plans found
            </div>
          )}

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              Create New Plan
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};