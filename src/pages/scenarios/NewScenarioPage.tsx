import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ScenarioBuilder } from '../../components/situational/ScenarioBuilder';
import { createScenario } from '../../services/situational';
import toast from 'react-hot-toast';

function NewScenarioPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleSave = async (data: any) => {
    if (!currentUser) {
      toast.error('You must be signed in to create scenarios');
      return;
    }

    try {
      // Add required fields for Firestore
      const scenarioData = {
        ...data,
        createdBy: currentUser.id,
        teamId: currentUser.teams?.[0], // Use first team for now
        difficulty: 'intermediate',
        tags: [],
        featured: false,
        status: 'active'
      };

      const scenarioId = await createScenario(scenarioData);
      
      if (scenarioId) {
        toast.success('Scenario created successfully');
        navigate('/scenarios');
      } else {
        throw new Error('Failed to create scenario');
      }
    } catch (error) {
      console.error('Error creating scenario:', error);
      toast.error('Failed to create scenario. Please try again.');
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-800">Create New Scenario</h1>
      </div>

      <ScenarioBuilder onSave={handleSave} />
    </div>
  );
}

export default NewScenarioPage;