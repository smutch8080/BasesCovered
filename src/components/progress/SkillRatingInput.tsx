import React from 'react';

interface Props {
  label: string;
  value: number | null;
  notApplicable: boolean;
  onChange: (value: number | null, notApplicable: boolean) => void;
}

export const SkillRatingInput: React.FC<Props> = ({
  label,
  value,
  notApplicable,
  onChange
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="space-y-2">
        <input
          type="range"
          min="1"
          max="10"
          value={value || 1}
          onChange={(e) => onChange(parseInt(e.target.value), false)}
          disabled={notApplicable}
          className={`w-full ${notApplicable ? 'opacity-50' : ''}`}
        />
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{value || 'N/A'}</span>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={notApplicable}
              onChange={(e) => onChange(null, e.target.checked)}
              className="rounded text-brand-primary focus:ring-brand-primary"
            />
            <span>N/A</span>
          </label>
        </div>
      </div>
    </div>
  );
};