import React from 'react';
import { Star, Check } from 'lucide-react';
import { Review } from '../../types/coach';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  reviews: Review[];
}

export const ReviewsList: React.FC<Props> = ({ reviews }) => {
  const sortedReviews = [...reviews].sort((a, b) => 
    b.createdAt.getTime() - a.createdAt.getTime()
  );

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No reviews yet
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedReviews.map((review) => (
        <div key={review.id} className="bg-gray-50 rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-800">{review.authorName}</span>
                {review.verified && (
                  <span className="flex items-center gap-1 text-green-600 text-sm">
                    <Check className="w-4 h-4" />
                    Verified Student
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(review.createdAt, { addSuffix: true })}
            </span>
          </div>
          {review.serviceType && (
            <div className="mb-2">
              <span className="text-sm text-gray-600">
                Service: {review.serviceType}
              </span>
            </div>
          )}
          <p className="text-gray-700 whitespace-pre-wrap">{review.comment}</p>
        </div>
      ))}
    </div>
  );
};