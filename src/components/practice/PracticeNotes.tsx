import React from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export const PracticeNotes: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Add notes about this practice session..."
        rows={4}
        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
      />
      <p className="mt-2 text-sm text-gray-500">
        Use this space to record observations, areas for improvement, or general notes about the practice.
      </p>
    </div>
  );
};