import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { collection, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ProgressReport, SkillRating } from '../types/progress';
import { Player } from '../types/team';
import { SkillRatingInput } from '../components/progress/SkillRatingInput';
import { PracticePlanSelector } from '../components/progress/PracticePlanSelector';
import { sendProgressReportNotification } from '../services/notifications/events';
import toast from 'react-hot-toast';

const initialSkillRating: SkillRating = {
  value: null,
  notApplicable: false
};

function ProgressReportPage() {
  const { teamId, playerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [skills, setSkills] = useState({
    hitting: { ...initialSkillRating },
    catching: { ...initialSkillRating },
    fielding: { ...initialSkillRating },
    popFlies: { ...initialSkillRating },
    bunting: { ...initialSkillRating },
    groundBalls: { ...initialSkillRating },
    gameAwareness: { ...initialSkillRating },
    baseRunning: { ...initialSkillRating },
    attitude: { ...initialSkillRating }
  });
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [areasForFocus, setAreasForFocus] = useState('');
  const [goals, setGoals] = useState('');
  const [selectedPlans, setSelectedPlans] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const loadPlayer = async () => {
      if (!teamId || !playerId) {
        navigate('/teams');
        return;
      }

      try {
        setIsLoading(true);
        const teamDoc = await getDoc(doc(db, 'teams', teamId));
        
        if (!teamDoc.exists()) {
          toast.error('Team not found');
          navigate('/teams');
          return;
        }

        const teamData = teamDoc.data();
        const playerData = teamData.players?.find((p: Player) => p.id === playerId);
        
        if (!playerData) {
          toast.error('Player not found');
          navigate(`/teams/${teamId}`);
          return;
        }

        setPlayer(playerData);
      } catch (error) {
        console.error('Error loading player:', error);
        toast.error('Unable to load player data');
        navigate(`/teams/${teamId}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlayer();
  }, [teamId, playerId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!player || !teamId) return;

    try {
      setIsLoading(true);
      console.log('Creating progress report for:', {
        playerId: player.id,
        playerName: player.name,
        teamId
      });

      const reportData: Omit<ProgressReport, 'id'> = {
        playerId: player.id,
        playerName: player.name,
        teamId,
        date: new Date(),
        skills,
        pros,
        cons,
        areasForFocus,
        goals,
        practicePlans: selectedPlans,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'progress_reports'), {
        ...reportData,
        date: Timestamp.fromDate(reportData.date),
        createdAt: Timestamp.fromDate(reportData.createdAt),
        updatedAt: Timestamp.fromDate(reportData.updatedAt)
      });

      console.log('Progress report created:', docRef.id);

      // Send notification
      if (player.email) {
        await sendProgressReportNotification(
          player.id,
          player.email,
          player.name,
          reportData.date
        );
      }

      toast.success('Progress report created successfully');
      navigate(`/teams/${teamId}/players/${playerId}/progress`);
    } catch (error) {
      console.error('Error creating progress report:', error);
      toast.error('Failed to create progress report');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Player not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to={`/teams/${teamId}/players/${playerId}/progress`}
          className="flex items-center gap-2 text-brand-primary hover:opacity-90"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Progress Reports
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            New Progress Report
          </h1>
          <p className="text-gray-600">
            Player: {player.name}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Skills Assessment */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Skills Assessment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(skills).map(([skill, rating]) => (
                <SkillRatingInput
                  key={skill}
                  label={skill.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  value={rating.value}
                  notApplicable={rating.notApplicable}
                  onChange={(value, notApplicable) => setSkills(prev => ({
                    ...prev,
                    [skill]: { value, notApplicable }
                  }))}
                />
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Feedback</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Strengths
                </label>
                <textarea
                  value={pros}
                  onChange={(e) => setPros(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                  placeholder="List player's strengths and accomplishments..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Areas for Improvement
                </label>
                <textarea
                  value={cons}
                  onChange={(e) => setCons(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                  placeholder="List areas that need improvement..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Focus Areas
                </label>
                <textarea
                  value={areasForFocus}
                  onChange={(e) => setAreasForFocus(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                  placeholder="Specific areas to focus on in practice..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goals
                </label>
                <textarea
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                  placeholder="Set goals for improvement..."
                />
              </div>
            </div>
          </div>

          {/* Practice Plans */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Recommended Practice Plans</h2>
            <PracticePlanSelector
              selectedPlanIds={selectedPlans.map(p => p.id)}
              onPlansSelected={setSelectedPlans}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Link
              to={`/teams/${teamId}/players/${playerId}/progress`}
              className="px-6 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Report...' : 'Create Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProgressReportPage;