import React, { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '../store';
import { DrillSelector } from '../components/practice/DrillSelector';
import { PracticeDetailsForm } from '../components/practice/PracticeDetailsForm';
import { WarmupSettings } from '../components/practice/WarmupSettings';
import { CurrentPlanDrills } from '../components/practice/CurrentPlanDrills';
import { TemplateCreationForm } from '../components/practice/TemplateCreationForm';

function NewPracticePlanPage() {
  const { initializePlan, loadDrills, loadTemplate } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isTemplate = searchParams.get('template') === 'true';
  const templateId = searchParams.get('template');

  useEffect(() => {
    const init = async () => {
      await loadDrills(); // Load drills first
      
      if (templateId && templateId !== 'true') {
        // Load template if template ID is provided
        await loadTemplate(templateId);
      } else {
        // Otherwise initialize empty plan
        initializePlan();
      }
    };
    init();

    // Cleanup function to reset plan when unmounting
    return () => {
      initializePlan();
    };
  }, [initializePlan, loadDrills, loadTemplate, templateId]);

  const handleTemplateComplete = () => {
    navigate('/practice-plan/templates');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          to={isTemplate ? "/practice-plan/templates" : "/saved-plans"}
          className="flex items-center gap-2 text-brand-primary hover:opacity-90"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to {isTemplate ? 'Templates' : 'Saved Plans'}
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        {isTemplate ? 'Create Practice Plan Template' : 'Create New Practice Plan'}
      </h1>

      {isTemplate ? (
        <TemplateCreationForm onComplete={handleTemplateComplete} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Plan Details */}
          <div className="lg:col-span-4 space-y-6">
            <PracticeDetailsForm />
            <WarmupSettings />
            <CurrentPlanDrills />
          </div>

          {/* Right Column - Drill Selection */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Available Drills</h2>
              <DrillSelector />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewPracticePlanPage;