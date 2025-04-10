import React, { forwardRef } from 'react';

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  className?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, description, className = '', ...props }, ref) => {
    const id = props.id || `switch-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={`flex items-start ${className}`}>
        <label className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            className="peer sr-only"
            {...props}
          />
          <span 
            className="absolute inset-0 rounded-full bg-gray-200 transition-colors peer-checked:bg-blue-600 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2"
          />
          <span 
            className="absolute inset-y-0 left-0 m-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" 
          />
        </label>
        {(label || description) && (
          <div className="ml-3 text-sm">
            {label && (
              <label htmlFor={id} className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                {label}
              </label>
            )}
            {description && (
              <p className="text-gray-500 dark:text-gray-400 mt-1">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Switch.displayName = 'Switch'; 