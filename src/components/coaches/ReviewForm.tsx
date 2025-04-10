import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { CoachingService } from '../../types/coach';

interface Props {
  services: CoachingService[];
  onSubmit: (data: { rating: number; comment: string; serviceType?: string }) => Promise<void>;
  isLoading: boolean;
}

export const ReviewForm: React.FC<Props> = ({ services, onSubmit, isLoading }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [serviceType, setServiceType] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      rating,
      comment,
      serviceType: serviceType || undefined
    });
    setRating(0);
    setComment('');
    setServiceType('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 hover:scale-110 transition-transform"
            >
              <Star
                className={`w-6 h-6 ${
                  (hoverRating || rating) >= value
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {services.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Type (Optional)
          </label>
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
          >
            <option value="">Select a service...</option>
            {services.map((service, index) => (
              <option key={index} value={service.type}>
                {service.type} Lessons
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Review
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          rows={4}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="Share your experience with this coach..."
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading || rating === 0 || !comment.trim()}
          className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
};