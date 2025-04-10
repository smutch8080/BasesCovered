import React from 'react';
import { useStore } from '../store';
import { DrillCard } from './DrillCard';
import { TimerTracker } from './TimerTracker';
import { EquipmentList } from './EquipmentList';
import { SavePlanDialog } from './SavePlanDialog';
import { Share2, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const PracticePlanView: React.FC = () => {
  const { currentPlan } = useStore();
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const navigate = useNavigate();

  if (!currentPlan) return null;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Practice Plan',
          text: 'Check out this practice plan',
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleStartPractice = () => {
    navigate(`/practice/${currentPlan.id}/timer`);
  };

  const drillsByCategory = currentPlan.drills.reduce((acc, drill) => {
    if (!acc[drill.category]) {
      acc[drill.category] = [];
    }
    acc[drill.category].push(drill);
    return acc;
  }, {} as Record<string, typeof currentPlan.drills>);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Current Practice Plan</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => setShowSaveDialog(true)}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Save Plan
        </button>
        <button
          onClick={handleShare}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
        <button
          onClick={handleStartPractice}
          className="w-full px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90 transition-colors flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" />
          Start Practice
        </button>
      </div>

      <TimerTracker />

      <EquipmentList drills={currentPlan.drills} />

      {Object.entries(drillsByCategory).map(([category, drills]) => (
        <div key={category} className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{category}</h3>
          <div className="space-y-4">
            {drills.map(drill => (
              <DrillCard
                key={drill.id}
                drill={drill}
                inPlan
                className="w-full"
              />
            ))}
          </div>
        </div>
      ))}

      <SavePlanDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
      />
    </div>
  );
};