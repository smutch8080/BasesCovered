import React, { useState } from 'react';
import { Review } from '../../types/coach';
import { RatingsSummary } from './RatingsSummary';
import { ReviewForm } from './ReviewForm';
import { ReviewsList } from './ReviewsList';
import { CoachingService } from '../../types/coach';

interface Props {
  reviews: Review[];
  services: CoachingService[];
  onSubmitReview: (data: { rating: number; comment: string; serviceType?: string }) => Promise<void>;
  canReview: boolean;
}

export const ReviewsSection: React.FC<Props> = ({
  reviews,
  services,
  onSubmitReview,
  canReview
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async (data: { rating: number; comment: string; serviceType?: string }) => {
    try {
      setIsSubmitting(true);
      await onSubmitReview(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <RatingsSummary reviews={reviews} />

      {canReview && (
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Write a Review</h3>
          <ReviewForm
            services={services}
            onSubmit={handleSubmitReview}
            isLoading={isSubmitting}
          />
        </div>
      )}

      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Reviews</h3>
        <ReviewsList reviews={reviews} />
      </div>
    </div>
  );
};