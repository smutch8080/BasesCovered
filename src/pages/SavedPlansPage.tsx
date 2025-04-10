import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, BookOpen } from 'lucide-react';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useStore } from '../store';
import { useAuth } from '../contexts/AuthContext';
import { SavedPracticePlan } from '../types';
import { SavedPlanCard } from '../components/SavedPlanCard';
import { DuplicatePlanDialog } from '../components/DuplicatePlanDialog';
import { DeletePlanDialog } from '../components/DeletePlanDialog';
import { DrillCategory } from '../types';
import { TemplateSelector } from '../components/practice/TemplateSelector';
import toast from 'react-hot-toast';

function SavedPlansPage() {
  const { savedPlans, loadSavedPlans, savePlan, initializePlan } = useStore();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [planToDuplicate, setPlanToDuplicate] = useState<SavedPracticePlan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<SavedPracticePlan | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [planType, setPlanType] = useState<'all' | 'regular' | 'player'>('all');
  const [selectedCategory, setSelectedCategory] = useState<DrillCategory | ''>('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  useEffect(() => {
    const loadPlans = async () => {
      if (currentUser) {
        try {
          setIsLoading(true);
          await loadSavedPlans(currentUser.id);
        } catch (error) {
          console.error('Error loading saved plans:', error);
          toast.error('Unable to load saved plans. Please try again later.');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadPlans();
  }, [currentUser, loadSavedPlans]);

  const handleEditPlan = (plan: SavedPracticePlan) => {
    navigate(`/practice-plan/${plan.id}/edit`);
  };

  const handleViewPlan = (plan: SavedPracticePlan) => {
    navigate(`/practice-plan/${plan.id}`);
  };

  const handleNewPlan = () => {
    navigate('/practice-plan/new');
  };

  const handleDuplicatePlan = async (name: string) => {
    if (!currentUser || !planToDuplicate) return;

    try {
      await savePlan(
        name, 
        currentUser.id, 
        false, 
        planToDuplicate.playerId, 
        planToDuplicate.playerName,
        planToDuplicate.description,
        planToDuplicate.notes,
        planToDuplicate.awards,
        planToDuplicate.teamId
      );
      toast.success('Plan duplicated successfully');
      setPlanToDuplicate(null);
    } catch (error) {
      console.error('Error duplicating plan:', error);
      toast.error('Failed to duplicate plan. Please try again.');
    }
  };

  const handleDeletePlan = async () => {
    if (!planToDelete) return;

    try {
      await deleteDoc(doc(db, 'practice_plans', planToDelete.id));
      await loadSavedPlans(currentUser!.id);
      toast.success('Practice plan deleted successfully');
      setPlanToDelete(null);
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Failed to delete plan. Please try again.');
    }
  };

  const filteredPlans = savedPlans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = planType === 'all' || 
      (planType === 'player' && plan.playerId) || 
      (planType === 'regular' && !plan.playerId);
    
    const matchesCategory = !selectedCategory || 
      plan.drills.some(drill => drill.category === selectedCategory);
    
    const planDate = new Date(plan.date || new Date());
    const matchesDateRange = (!dateRange.start || planDate >= new Date(dateRange.start)) &&
      (!dateRange.end || planDate <= new Date(dateRange.end));

    return matchesSearch && matchesType && matchesCategory && matchesDateRange;
  });

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg text-gray-600">Please sign in to view your saved plans.</p>
        <Link to="/login" className="text-brand-primary hover:opacity-90 mt-4 inline-block">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Saved Practice Plans</h1>
        <div className="flex gap-4">
          <Link
            to="/practice-plan/templates"
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg
              hover:bg-gray-700 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Templates
          </Link>
          <button
            onClick={handleNewPlan}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
              hover:opacity-90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Practice Plan
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search plans..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div>
            <select
              value={planType}
              onChange={(e) => setPlanType(e.target.value as 'all' | 'regular' | 'player')}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            >
              <option value="all">All Plans</option>
              <option value="regular">Regular Plans</option>
              <option value="player">Player Plans</option>
            </select>
          </div>

          <div>
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

          <div className="space-y-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              placeholder="Start date"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              placeholder="End date"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading saved plans...</p>
          </div>
        ) : filteredPlans.length > 0 ? (
          filteredPlans.map((plan) => (
            <SavedPlanCard
              key={plan.id}
              plan={plan}
              onView={() => handleViewPlan(plan)}
              onEdit={() => handleEditPlan(plan)}
              onDuplicate={() => setPlanToDuplicate(plan)}
              onDelete={() => setPlanToDelete(plan)}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No saved practice plans found matching your filters.
          </div>
        )}
      </div>

      {showTemplateSelector && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <TemplateSelector onClose={() => setShowTemplateSelector(false)} />
          </div>
        </div>
      )}

      {planToDuplicate && (
        <DuplicatePlanDialog
          isOpen={!!planToDuplicate}
          onClose={() => setPlanToDuplicate(null)}
          onConfirm={handleDuplicatePlan}
          plan={planToDuplicate}
        />
      )}

      {planToDelete && (
        <DeletePlanDialog
          isOpen={!!planToDelete}
          onClose={() => setPlanToDelete(null)}
          onConfirm={handleDeletePlan}
          planName={planToDelete.name}
        />
      )}
    </div>
  );
}

export default SavedPlansPage;