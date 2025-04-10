import React from 'react';
import { useStore } from '../../store';

export const WarmupSettings: React.FC = () => {
  const { currentPlan, updatePlanDetails } = useStore();

  if (!currentPlan) return null;

  const handleWarmupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    updatePlanDetails({
      warmup: {
        enabled,
        duration: enabled ? 15 : 0
      }
    });
  };

  const handleWarmupDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const duration = parseInt(e.target.value, 10);
    if (currentPlan.warmup) {
      updatePlanDetails({
        warmup: {
          ...currentPlan.warmup,
          duration
        }
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Warmup Settings</h2>
      
      <div className="space-y-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={currentPlan.warmup?.enabled ?? false}
            onChange={handleWarmupChange}
            className="rounded text-brand-primary focus:ring-brand-primary"
          />
          <span className="text-gray-700">Include Warmup Time</span>
        </label>

        {currentPlan.warmup?.enabled && (
          <div className="ml-6">
            <label className="block text-sm text-gray-700 mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={currentPlan.warmup.duration}
              onChange={handleWarmupDurationChange}
              className="w-full max-w-xs px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              min="5"
              max="30"
              step="5"
            />
          </div>
        )}
      </div>
    </div>
  );
};