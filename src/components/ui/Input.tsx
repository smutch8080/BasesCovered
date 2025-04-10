import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm
            ${error 
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:ring-brand-500 focus:border-brand-500'
            } ${className}`}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-500">{error}</p>
        )}
      </div>
    );
  }
); 