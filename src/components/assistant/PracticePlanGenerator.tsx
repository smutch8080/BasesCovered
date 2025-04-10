import React, { useState } from 'react';
import { ClipboardList, Save } from 'lucide-react';
import { generatePracticePlan } from '../../lib/openai';
import { ErrorDisplay } from './ErrorDisplay';
import { useStore } from '../../store';
import { useAuth } from '../../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

export const PracticePlanGenerator: React.FC = () => {
  const { currentUser } = useAuth();
  const { savePlan, initializePlan } = useStore();
  const [focus, setFocus] = useState('');
  const [duration, setDuration] = useState(60);
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [playerCount, setPlayerCount] = useState<number>();
  const [equipment, setEquipment] = useState<string>('');
  const [generatedPlan, setGeneratedPlan] = useState<string>('');
  const [planName, setPlanName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      setIsLoading(true);
      const plan = await generatePracticePlan({
        focus,
        duration,
        skillLevel,
        playerCount,
        equipment: equipment.split(',').map(e => e.trim()).filter(Boolean)
      });
      
      setGeneratedPlan(plan || '');
      setPlanName(`${focus} Practice - ${skillLevel} Level`);
    } catch (error) {
      console.error('Error generating practice plan:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate practice plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!currentUser || !generatedPlan) return;

    try {
      setIsSaving(true);
      
      // Initialize a new plan
      initializePlan();
      
      // Save the plan
      await savePlan(
        planName,
        currentUser.id,
        false,
        undefined,
        undefined,
        generatedPlan,
        generatedPlan,
        []
      );

      toast.success('Practice plan saved successfully');
      
      // Reset form
      setFocus('');
      setDuration(60);
      setSkillLevel('intermediate');
      setPlayerCount(undefined);
      setEquipment('');
      setGeneratedPlan('');
      setPlanName('');
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error('Failed to save practice plan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    handleSubmit(new Event('submit') as any);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Focus Area
          </label>
          <input
            type="text"
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            placeholder="e.g., Hitting, Fielding, Base Running"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              required
              min={30}
              max={180}
              step={15}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skill Level
            </label>
            <select
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Players (optional)
            </label>
            <input
              type="number"
              value={playerCount || ''}
              onChange={(e) => setPlayerCount(e.target.value ? parseInt(e.target.value) : undefined)}
              min={1}
              max={30}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Available Equipment (optional)
            </label>
            <input
              type="text"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              placeholder="e.g., balls, bats, tees, nets"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90
            disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ClipboardList className="w-4 h-4" />
          {isLoading ? 'Generating Plan...' : 'Generate Practice Plan'}
        </button>
      </form>

      {error && (
        <ErrorDisplay message={error} onRetry={handleRetry} />
      )}

      {generatedPlan && !error && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b p-4">
            <div className="flex items-center justify-between mb-4">
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="text-xl font-semibold text-gray-800 bg-transparent border-b border-transparent 
                  hover:border-gray-300 focus:border-brand-primary focus:outline-none px-2 py-1"
                placeholder="Enter plan name"
              />
              <button
                onClick={handleSavePlan}
                disabled={isSaving || !planName.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg 
                  hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Plan'}
              </button>
            </div>
          </div>
          <div className="p-6 prose max-w-none">
            <ReactMarkdown>{generatedPlan}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};