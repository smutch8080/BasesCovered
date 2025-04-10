import React from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  message: string;
  onRetry?: () => void;
}

export const ErrorDisplay: React.FC<Props> = ({ message, onRetry }) => {
  return (
    <div className="p-4 bg-red-50 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
        <div>
          <p className="text-red-700">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm text-red-600 hover:text-red-700"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};