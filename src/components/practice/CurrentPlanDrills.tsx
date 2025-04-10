import React, { useState } from 'react';
import { useStore } from '../../store';
import { DrillCard } from '../DrillCard';
import { TimerTracker } from '../TimerTracker';
import { EquipmentList } from '../EquipmentList';
import { SavePlanDialog } from '../SavePlanDialog';
import { SaveNewPlanDialog } from '../SaveNewPlanDialog';
import { Save } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const CurrentPlanDrills: React.FC = () => {
  const { currentPlan } = useStore();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const location = useLocation();
  const isNewPlan = location.pathname === '/practice-plan/new';

  if (!currentPlan) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Current Plan</h2>
        <button
          onClick={() => setShowSaveDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Plan
        </button>
      </div>

      <TimerTracker />
      <EquipmentList drills={currentPlan.drills} />
      
      <div className="space-y-4 max-h-[calc(100vh-36rem)] overflow-y-auto pr-2">
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
            No drills added to the plan yet. Select drills from the available list.
          </p>
        )}
      </div>

      {isNewPlan ? (
        <SaveNewPlanDialog
          isOpen={showSaveDialog}
          onClose={() => setShowSaveDialog(false)}
          teamId={currentPlan.teamId}
        />
      ) : (
        <SavePlanDialog
          isOpen={showSaveDialog}
          onClose={() => setShowSaveDialog(false)}
        />
      )}
    </div>
  );
};