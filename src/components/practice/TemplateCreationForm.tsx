import React, { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { DrillCategory, PracticePlanTemplate } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../store';
import { DrillSelector } from './DrillSelector';
import { CurrentPlanDrills } from './CurrentPlanDrills';
import { WarmupSettings } from './WarmupSettings';
import toast from 'react-hot-toast';

interface Props {
  onComplete: () => void;
}

export const TemplateCreationForm: React.FC<Props> = ({ onComplete }) => {
  const { currentUser } = useAuth();
  const { currentPlan } = useStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [categories, setCategories] = useState<DrillCategory[]>([]);
  const [featured, setFeatured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentPlan) return;

    if (currentPlan.drills.length === 0) {
      toast.error('Please add at least one drill to the template');
      return;
    }

    try {
      setIsLoading(true);

      const templateData: Omit<PracticePlanTemplate, 'id'> = {
        name: name.trim(),
        description: description.trim(),
        skillLevel,
        categories,
        drills: currentPlan.drills,
        duration: currentPlan.duration,
        warmup: currentPlan.warmup,
        notes: currentPlan.notes,
        isTemplate: true,
        featured,
        createdBy: currentUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, 'practice_plans'), {
        ...templateData,
        createdAt: Timestamp.fromDate(templateData.createdAt),
        updatedAt: Timestamp.fromDate(templateData.updatedAt)
      });

      toast.success('Template created successfully');
      onComplete();
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (category: DrillCategory) => {
    setCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Template Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            placeholder="Enter template name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            placeholder="Describe what this template is best used for"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Skill Level
          </label>
          <select
            value={skillLevel}
            onChange={(e) => setSkillLevel(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categories
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.values(DrillCategory).map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`px-3 py-2 rounded-lg border-2 transition-colors ${
                  categories.includes(category)
                    ? 'border-brand-primary bg-brand-primary/5'
                    : 'border-gray-200 hover:border-brand-primary/50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {currentUser?.role === 'admin' && (
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="rounded text-brand-primary focus:ring-brand-primary"
              />
              <span className="text-sm text-gray-700">
                Feature this template
              </span>
            </label>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onComplete}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !name.trim() || !description.trim() || categories.length === 0 || currentPlan?.drills.length === 0}
            className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Template'}
          </button>
        </div>
      </form>

      <div className="space-y-6">
        <WarmupSettings />
        <CurrentPlanDrills />
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Add Drills</h2>
          <DrillSelector />
        </div>
      </div>
    </div>
  );
};