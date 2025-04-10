import React from 'react';
import { useStore } from '../store';

export const TimerTracker: React.FC = () => {
  const { currentPlan } = useStore();
  
  if (!currentPlan) return null;

  const warmupTime = currentPlan.warmup?.enabled ? currentPlan.warmup.duration : 0;
  const totalDrillTime = currentPlan.drills.reduce((total, drill) => total + drill.duration, 0) + warmupTime;
  const remainingTime = currentPlan.duration - totalDrillTime;
  const isOvertime = remainingTime < 0;
  const percentComplete = Math.min((totalDrillTime / currentPlan.duration) * 100, 100);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Practice Timer</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Practice Time:</span>
          <span className="font-medium">{currentPlan.duration} minutes</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Planned Drill Time:</span>
          <span className="font-medium">{totalDrillTime} minutes</span>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              PROGRESS
            </span>
            <span className="text-xs font-semibold text-blue-600">
              {percentComplete.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${isOvertime ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Remaining Time:</span>
          <span className={`font-medium ${isOvertime ? 'text-red-500' : 'text-green-500'}`}>
            {Math.abs(remainingTime)} minutes {isOvertime ? 'over' : 'left'}
          </span>
        </div>
      </div>
    </div>
  );
};