import React from 'react';
import { Star } from 'lucide-react';

interface Props {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export const RatingDisplay: React.FC<Props> = ({ 
  rating, 
  reviewCount = 0, 
  size = 'md',
  showCount = true 
}) => {
  const starSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${starSizes[size]} ${
              i < Math.round(rating)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      {showCount && (
        <span className={`${textSizes[size]} text-gray-600`}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
};