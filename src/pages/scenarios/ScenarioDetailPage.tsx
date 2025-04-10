import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Scenario } from '../../types/situational';
import { ScenarioPlayer } from '../../components/situational/ScenarioPlayer';
import { submitScenarioAttempt } from '../../services/situational';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

function ScenarioDetailPage() {
  const { scenarioId } = useParams();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadScenario = async () => {
      if (!scenarioId) return;

      try {
        setIsLoading(true);
        const scenarioDoc = await getDoc(doc(db, 'scenarios', scenarioId));
        
        if (scenarioDoc.exists()) {
          const data = scenarioDoc.data();
          setScenario({
            ...data,
            id: scenarioDoc.id,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          } as Scenario);
        } else {
          toast.error('Scenario not found');
          navigate('/scenarios');
        }
      } catch (error) {
        console.error('Error loading scenario:', error);
        toast.error('Unable to load scenario');
        navigate('/scenarios');
      } finally {
        setIsLoading(false);
      }
    };

    loadScenario();
  }, [scenarioId, navigate]);

  const handleComplete = async (score: number) => {
    if (!currentUser || !scenario) {
      toast.error('You must be signed in to submit attempts');
      navigate('/login');
      return;
    }

    try {
      setIsSubmitting(true);

      // Ensure score is a valid number between 0-100
      const validScore = Math.min(Math.max(Math.round(score), 0), 100);

      await submitScenarioAttempt({
        scenarioId: scenario.id,
        userId: currentUser.id,
        teamId: scenario.teamId || undefined,
        score: validScore,
        answers: [], // TODO: Track individual answers
        totalTime: 0 // TODO: Track time spent
      });

      toast.success('Scenario completed successfully!');
      navigate('/scenarios/leaderboard');
    } catch (error) {
      console.error('Error submitting scenario attempt:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to submit scenario attempt');
      }
    } finally {
      setIsSubmitting(false);
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

  if (!scenario) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Scenario not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/scenarios"
          className="flex items-center gap-2 text-brand-primary hover:opacity-90"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Scenarios
        </Link>
      </div>

      <ScenarioPlayer
        title={scenario.title}
        description={scenario.description}
        positions={scenario.positions}
        questions={scenario.questions}
        onComplete={handleComplete}
      />

      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-4"></div>
            <p className="text-gray-800">Submitting your attempt...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScenarioDetailPage;