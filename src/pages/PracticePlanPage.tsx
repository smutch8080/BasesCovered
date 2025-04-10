import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useStore } from '../store';
import { SavedPracticePlan } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { PracticePlanView } from '../components/practice/PracticePlanView';
import toast from 'react-hot-toast';
import { PageLayout } from '../components/layout/PageLayout';

function PracticePlanPage() {
  const location = useLocation();
  const { planId } = useParams();
  const { playerId, playerName, teamId } = location.state || {};
  const { currentUser } = useAuth();
  const { currentPlan, loadPlan, updatePlanDetails, initializePlan } = useStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPlanData = async () => {
      try {
        setIsLoading(true);
        
        if (planId) {
          // Load existing plan
          const planDoc = await getDoc(doc(db, 'practice_plans', planId));
          if (planDoc.exists()) {
            const data = planDoc.data();
            loadPlan({
              ...data,
              id: planDoc.id,
              date: data.date.toDate(),
              createdAt: data.createdAt.toDate(),
              updatedAt: data.updatedAt.toDate(),
              awards: data.awards?.map((award: any) => ({
                ...award,
                date: award.date.toDate(),
                createdAt: award.createdAt?.toDate() || new Date(),
                updatedAt: award.updatedAt?.toDate() || new Date()
              })) || []
            } as SavedPracticePlan);
          } else {
            toast.error('Practice plan not found');
          }
        } else {
          // Initialize new plan
          initializePlan();
          if (teamId) {
            const teamDoc = await getDoc(doc(db, 'teams', teamId));
            if (teamDoc.exists()) {
              const teamData = teamDoc.data();
              updatePlanDetails({ 
                teamId,
                teamName: teamData.name,
                playerId,
                playerName
              });
            }
          }
        }
      } catch (error) {
        console.error('Error loading practice plan:', error);
        toast.error('Failed to load practice plan');
      } finally {
        setIsLoading(false);
      }
    };

    loadPlanData();
  }, [planId, teamId, playerId, playerName, loadPlan, initializePlan, updatePlanDetails]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      </div>
    );
  }

  if (!currentPlan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Practice plan not found</p>
          <Link
            to="/saved-plans"
            className="text-brand-primary hover:opacity-90 mt-4 inline-block"
          >
            Back to Saved Plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PageLayout className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            to="/saved-plans"
            className="flex items-center gap-2 text-brand-primary hover:opacity-90"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Saved Plans
          </Link>
        </div>

        <PracticePlanView />
      </div>
    </PageLayout>
  );
}

export default PracticePlanPage;