import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { SavedPracticePlan } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onPlansSelected: (plans: { id: string; name: string }[]) => void;
  selectedPlanIds: string[];
}

export const PracticePlanSelector: React.FC<Props> = ({
  isOpen,
  onClose,
  onPlansSelected,
  selectedPlanIds
}) => {
  const [plans, setPlans] = useState<SavedPracticePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlans, setSelectedPlans] = useState<Set<string>>(new Set(selectedPlanIds));
  const { currentUser } = useAuth();

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

  const filteredPlans = plans.filter(plan => 
    plan.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTogglePlan = (planId: string) => {
    const newSelected = new Set(selectedPlans);
    if (newSelected.has(planId)) {
      newSelected.delete(planId);
    } else {
      newSelected.add(planId);
    }
    setSelectedPlans(newSelected);
  };

  const handleSave = () => {
    const selectedPlansList = Array.from(selectedPlans).map(id => {
      const plan = plans.find(p => p.id === id);
      return {
        id,
        name: plan?.name || 'Unnamed Plan'
      };
    });
    onPlansSelected(selectedPlansList);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
          <Dialog.Title className="text-xl font-bold mb-4">
            Select Practice Plans
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
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {filteredPlans.length > 0 ? (
                <div className="space-y-2">
                  {filteredPlans.map((plan) => (
                    <label
                      key={plan.id}
                      className="flex items-center p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPlans.has(plan.id)}
                        onChange={() => handleTogglePlan(plan.id)}
                        className="rounded text-brand-primary focus:ring-brand-primary mr-3"
                      />
                      <div>
                        <div className="font-medium">{plan.name}</div>
                        <div className="text-sm text-gray-500">
                          Created: {new Date(plan.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No practice plans found
                </div>
              )}
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
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90"
            >
              Add Selected Plans
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};