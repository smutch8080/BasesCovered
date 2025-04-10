import React from 'react';
import { ClipboardList } from 'lucide-react';
import { PracticePlanGenerator } from './PracticePlanGenerator';

export const PlanGenerator: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <ClipboardList className="w-6 h-6 text-brand-primary" />
        <h2 className="text-xl font-semibold text-gray-800">Generate Practice Plan</h2>
      </div>
      <PracticePlanGenerator />
    </div>
  );
};