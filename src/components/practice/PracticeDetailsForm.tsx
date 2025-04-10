import React from 'react';
import { Users } from 'lucide-react';
import { useStore } from '../../store';
import { TeamSelector } from './TeamSelector';

export const PracticeDetailsForm: React.FC = () => {
  const { currentPlan, updatePlanDetails } = useStore();

  if (!currentPlan) return null;

  const handleTeamSelect = (teamId: string, teamName: string) => {
    updatePlanDetails({ 
      teamId,
      teamName
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Practice Details</h2>
      
      <div className="space-y-4">
        <div>
          <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
            <Users className="w-5 h-5 text-brand-primary" />
            Team
          </label>
          <TeamSelector
            value={currentPlan.teamId}
            onChange={handleTeamSelect}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration (minutes)
          </label>
          <input
            type="number"
            value={currentPlan.duration}
            onChange={(e) => updatePlanDetails({ duration: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            placeholder="Enter practice duration"
            min="30"
            max="240"
            step="15"
          />
        </div>
      </div>
    </div>
  );
};