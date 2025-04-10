import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { Lesson } from '../../types/lessons';
import { LessonSection } from './LessonSection';
import { LessonProgress } from './LessonProgress';

interface Props {
  lesson: Lesson;
  onComplete: () => void;
}

export const LessonWizard: React.FC<Props> = ({ lesson, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isCompleted, setIsCompleted] = useState(false);

  const sections = [
    { title: 'Introduction', content: lesson.introduction },
    { title: 'Understanding the Basics', content: lesson.basics },
    { title: 'Step-by-Step Mechanics', content: lesson.mechanics },
    { title: 'Strategic Insights', content: lesson.insights },
    { title: 'Conclusion', content: lesson.conclusion },
    ...(lesson.faqs ? [{ title: 'FAQs', content: lesson.faqs }] : [])
  ];

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    if (currentStep < sections.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else if (!isCompleted) {
      setIsCompleted(true);
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const currentSection = sections[currentStep];
  const progress = (completedSteps.size / sections.length) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{lesson.title}</h1>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: lesson.summary }} />
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <LessonProgress
          sections={sections}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={setCurrentStep}
        />
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-8">
          <LessonSection
            title={currentSection.title}
            content={currentSection.content}
          />
        </div>

        <div className="border-t p-6 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {completedSteps.has(currentStep) && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            <button
              onClick={handleNext}
              className={`flex items-center gap-2 px-6 py-2 ${
                isCompleted ? 'bg-green-600' : 'bg-brand-primary'
              } text-white rounded-lg hover:opacity-90 transition-colors`}
            >
              {isCompleted ? 'Completed!' : currentStep === sections.length - 1 ? 'Complete' : 'Next'}
              {!isCompleted && currentStep < sections.length - 1 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};