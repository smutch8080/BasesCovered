import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store';
import { PracticeTimer } from '../components/practice/PracticeTimer';

function PracticePlanTimer() {
  const { currentPlan } = useStore();
  const navigate = useNavigate();
  const { planId } = useParams();

  if (!currentPlan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Practice plan not found</p>
      </div>
    );
  }

  const handleExit = () => {
    navigate(`/practice-plan/${planId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <PracticeTimer
          drills={currentPlan.drills}
          warmup={currentPlan.warmup}
          onExit={handleExit}
        />
      </div>
    </div>
  );
}

export default PracticePlanTimer;