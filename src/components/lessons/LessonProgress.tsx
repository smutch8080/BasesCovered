import React from 'react';
import { CheckCircle } from 'lucide-react';

interface Props {
  sections: { title: string }[];
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick: (step: number) => void;
}

export const LessonProgress: React.FC<Props> = ({
  sections,
  currentStep,
  completedSteps,
  onStepClick
}) => {
  return (
    <div className="relative">
      <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200">
        <div
          className="h-full bg-brand-primary transition-all"
          style={{ width: `${(completedSteps.size / sections.length) * 100}%` }}
        />
      </div>

      <div className="relative flex justify-between">
        {sections.map((section, index) => {
          const isCompleted = completedSteps.has(index);
          const isCurrent = currentStep === index;

          return (
            <button
              key={index}
              onClick={() => onStepClick(index)}
              className="flex flex-col items-center gap-2"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center
                  ${isCompleted ? 'bg-brand-primary text-white' : 
                    isCurrent ? 'bg-white border-2 border-brand-primary text-brand-primary' : 
                    'bg-white border-2 border-gray-200 text-gray-400'}`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <span className="font-semibold">{index + 1}</span>
                )}
              </div>
              <span className={`text-sm font-medium text-center
                ${isCurrent ? 'text-brand-primary' : 
                  isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                {section.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};