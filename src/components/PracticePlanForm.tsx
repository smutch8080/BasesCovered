import React, { useState } from 'react';
import { useStore } from '../store';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

export const PracticePlanForm: React.FC = () => {
  const { currentPlan, updatePlanDetails } = useStore();
  const [showNotes, setShowNotes] = useState(false);

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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Practice Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
              <Users className="w-5 h-5 text-brand-primary" />
              Team Name
            </label>
            <input
              type="text"
              value={currentPlan.teamName}
              onChange={(e) => updatePlanDetails({ teamName: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              placeholder="Enter team name"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
              <Calendar className="w-5 h-5 text-brand-primary" />
              Practice Date
            </label>
            <input
              type="date"
              value={currentPlan.date instanceof Date ? currentPlan.date.toISOString().split('T')[0] : ''}
              onChange={(e) => updatePlanDetails({ date: new Date(e.target.value) })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
              <Clock className="w-5 h-5 text-brand-primary" />
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

          <div>
            <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
              <MapPin className="w-5 h-5 text-brand-primary" />
              Location
            </label>
            <input
              type="text"
              value={currentPlan.location}
              onChange={(e) => updatePlanDetails({ location: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              placeholder="Enter practice location"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t">
        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={currentPlan.warmup?.enabled ?? false}
            onChange={handleWarmupChange}
            className="rounded text-brand-primary focus:ring-brand-primary"
          />
          <span className="text-gray-700 font-medium">Include Warmup Time</span>
        </label>

        {currentPlan.warmup?.enabled && (
          <div className="ml-6">
            <label className="block text-gray-700 font-medium mb-2">
              Warmup Duration (minutes)
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

      <div className="mt-6 pt-6 border-t">
        <button
          type="button"
          onClick={() => setShowNotes(!showNotes)}
          className="text-brand-primary hover:opacity-90"
        >
          {showNotes ? 'Hide Notes' : 'Add Practice Notes'}
        </button>

        {showNotes && (
          <div className="mt-4">
            <textarea
              value={currentPlan.notes || ''}
              onChange={(e) => updatePlanDetails({ notes: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              placeholder="Add any notes about this practice session..."
              rows={4}
            />
          </div>
        )}
      </div>
    </div>
  );
};