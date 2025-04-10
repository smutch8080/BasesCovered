import React, { useState, useEffect } from 'react';
import { Share2, Play, Award, FileText, Save } from 'lucide-react';
import { useStore } from '../../store';
import { DrillCard } from '../DrillCard';
import { TimerTracker } from '../TimerTracker';
import { EquipmentList } from '../EquipmentList';
import { SavePlanDialog } from '../SavePlanDialog';
import { PracticeTimer } from './PracticeTimer';
import { AwardDialog } from '../awards/AwardDialog';
import { AwardsList } from '../awards/AwardsList';
import { PracticeNotes } from './PracticeNotes';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Team } from '../../types/team';
import toast from 'react-hot-toast';

export const PracticePlanView: React.FC = () => {
  const { currentUser } = useAuth();
  const { currentPlan, updatePlanDetails } = useStore();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showAwardDialog, setShowAwardDialog] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [team, setTeam] = useState<Team | null>(null);

  useEffect(() => {
    const loadTeam = async () => {
      if (currentPlan?.teamId) {
        try {
          const teamDoc = await getDoc(doc(db, 'teams', currentPlan.teamId));
          if (teamDoc.exists()) {
            setTeam(teamDoc.data() as Team);
          }
        } catch (error) {
          console.error('Error loading team:', error);
        }
      }
    };

    loadTeam();
  }, [currentPlan?.teamId]);

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

  const handleAwardGiven = (award: any) => {
    const updatedAwards = [...(currentPlan.awards || []), award];
    updatePlanDetails({ awards: updatedAwards });
    toast.success('Award given successfully');
  };

  const handleNotesChange = (notes: string) => {
    updatePlanDetails({ notes });
  };

  const handleExitTimer = () => {
    setShowTimer(false);
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => setShowSaveDialog(true)}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
            transition-colors flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Plan
        </button>
        <button
          onClick={handleShare}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
            transition-colors flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
        <button
          onClick={() => setShowTimer(true)}
          className="w-full px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90 
            transition-colors flex items-center justify-center gap-2 md:col-span-2"
        >
          <Play className="w-4 h-4" />
          Start Practice
        </button>
      </div>

      {showTimer ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <PracticeTimer
            drills={currentPlan.drills}
            warmup={currentPlan.warmup}
            onComplete={() => setShowTimer(false)}
            onExit={handleExitTimer}
          />
        </div>
      ) : (
        <>
          <TimerTracker />
          <EquipmentList drills={currentPlan.drills} />

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Awards</h3>
              <button
                onClick={() => setShowAwardDialog(true)}
                className="flex items-center gap-2 px-4 py-2 text-brand-primary hover:bg-gray-50 rounded-lg"
              >
                <Award className="w-4 h-4" />
                Give Award
              </button>
            </div>
            <AwardsList awards={currentPlan.awards || []} />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Practice Notes</h3>
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="flex items-center gap-2 px-4 py-2 text-brand-primary hover:bg-gray-50 rounded-lg"
              >
                <FileText className="w-4 h-4" />
                {showNotes ? 'Hide Notes' : 'Show Notes'}
              </button>
            </div>
            {showNotes && (
              <PracticeNotes
                value={currentPlan.notes || ''}
                onChange={handleNotesChange}
              />
            )}
          </div>

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
        </>
      )}

      <SavePlanDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
      />

      <AwardDialog
        isOpen={showAwardDialog}
        onClose={() => setShowAwardDialog(false)}
        teamId={currentPlan.teamId || ''}
        players={team?.players.map(p => ({
          id: p.id,
          name: p.name,
          jerseyNumber: p.jerseyNumber
        })) || []}
        onAwardGiven={handleAwardGiven}
      />
    </div>
  );
};