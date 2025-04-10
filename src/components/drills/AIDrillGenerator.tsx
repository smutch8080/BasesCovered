import React, { useState } from 'react';
import { Bot } from 'lucide-react';
import { generateChatResponse } from '../../lib/openai';
import { ErrorDisplay } from '../assistant/ErrorDisplay';
import { DrillCategory } from '../../types';
import toast from 'react-hot-toast';

interface Props {
  onGenerated: (drillData: {
    name: string;
    shortDescription: string;
    description: string;
    whatToLookFor: string;
    equipment: string[];
  }) => void;
  category: DrillCategory;
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
}

export const AIDrillGenerator: React.FC<Props> = ({
  onGenerated,
  category,
  experienceLevel
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const prompt = `Create a detailed softball drill with the following requirements:
        - Category: ${category}
        - Skill Level: ${experienceLevel}

        Please provide the following information in JSON format:
        {
          "name": "Drill name",
          "shortDescription": "Brief 1-2 sentence description",
          "description": "Detailed step-by-step instructions",
          "whatToLookFor": "Key coaching points and success indicators",
          "equipment": ["List of required equipment"]
        }`;

      const response = await generateChatResponse([{ role: 'user', content: prompt }]);
      
      if (!response) {
        throw new Error('Failed to generate drill content');
      }

      try {
        const drillData = JSON.parse(response);
        onGenerated(drillData);
        toast.success('Drill content generated successfully');
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        throw new Error('Invalid response format from AI');
      }
    } catch (error) {
      console.error('Error generating drill:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate drill content');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="flex items-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-brand-primary 
          to-brand-secondary text-white rounded-lg hover:opacity-90 disabled:opacity-50 
          disabled:cursor-not-allowed transition-opacity"
      >
        <Bot className="w-5 h-5" />
        {isLoading ? 'Generating Content...' : 'Generate Content with AI'}
      </button>

      {error && (
        <div className="mt-4">
          <ErrorDisplay 
            message={error} 
            onRetry={handleGenerate}
          />
        </div>
      )}
    </div>
  );
};