import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useStore } from '../store';
import { PracticeDetailsForm } from '../components/practice/PracticeDetailsForm';
import { DrillCard } from '../components/DrillCard';
import { CategoryFilter } from '../components/CategoryFilter';
import { SavedPracticePlan } from '../types';
import toast from 'react-hot-toast';

function EditPracticePlanPage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { currentPlan, loadPlan, drills, selectedCategory, addDrillToPlan } = useStore();

  useEffect(() => {
    const loadPlanData = async () => {
      if (!planId) {
        navigate('/saved-plans');
        return;
      }

      try {
        const planDoc = await getDoc(doc(db, 'practice_plans', planId));
        if (planDoc.exists()) {
          const data = planDoc.data();
          loadPlan({
            ...data,
            id: planDoc.id,
            date: data.date.toDate(),
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          } as SavedPracticePlan);
        } else {
          toast.error('Practice plan not found');
          navigate('/saved-plans');
        }
      } catch (error) {
        console.error('Error loading practice plan:', error);
        toast.error('Failed to load practice plan');
        navigate('/saved-plans');
      }
    };

    loadPlanData();
  }, [planId, loadPlan, navigate]);

  const handleSave = async () => {
    if (!currentPlan || !planId) return;

    try {
      const planRef = doc(db, 'practice_plans', planId);
      await updateDoc(planRef, {
        ...currentPlan,
        updatedAt: new Date()
      });
      
      toast.success('Practice plan saved successfully');
      navigate('/saved-plans');
    } catch (error) {
      console.error('Error saving practice plan:', error);
      toast.error('Failed to save practice plan');
    }
  };

  if (!currentPlan) return null;

  const filteredDrills = selectedCategory
    ? drills.filter(drill => drill.category === selectedCategory)
    : drills;

  const isDrillInPlan = (drillId: string) => {
    return currentPlan.drills.some(d => d.id === drillId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            to="/saved-plans"
            className="flex items-center gap-2 text-brand-primary hover:opacity-90"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Saved Plans
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Edit Practice Plan</h1>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
            hover:opacity-90 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <PracticeDetailsForm />
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <CategoryFilter />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              {filteredDrills.map(drill => (
                <DrillCard 
                  key={drill.id} 
                  drill={drill}
                  inPlan={isDrillInPlan(drill.id)}
                  onAdd={() => addDrillToPlan(drill)}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Current Drills</h2>
            <div className="space-y-4">
              {currentPlan.drills.map((drill) => (
                <DrillCard 
                  key={drill.id} 
                  drill={drill} 
                  inPlan 
                  className="w-full"
                />
              ))}
              {currentPlan.drills.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  No drills added to the plan yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditPracticePlanPage;