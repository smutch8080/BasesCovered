import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Chant, ChantRating } from '../types/chants';
import { ArrowLeft, Star, Users, Clock, Music } from 'lucide-react';
import toast from 'react-hot-toast';

function ChantDetailPage() {
  const { chantId } = useParams();
  const [chant, setChant] = useState<Chant | null>(null);
  const [ratings, setRatings] = useState<ChantRating[]>([]);
  const [userRating, setUserRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    loadChantData();
  }, [chantId]);

  const loadChantData = async () => {
    if (!chantId) return;

    try {
      setIsLoading(true);
      const chantDoc = await getDoc(doc(db, 'chants', chantId));
      
      if (chantDoc.exists()) {
        const data = chantDoc.data();
        setChant({
          ...data,
          id: chantDoc.id,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          featuredUntil: data.featuredUntil?.toDate()
        } as Chant);

        // Load ratings
        const ratingsRef = collection(db, 'chant_ratings');
        const q = query(ratingsRef, where('chantId', '==', chantId));
        const ratingsSnapshot = await getDocs(q);
        
        const loadedRatings: ChantRating[] = [];
        ratingsSnapshot.forEach(doc => {
          const ratingData = doc.data();
          loadedRatings.push({
            ...ratingData,
            id: doc.id,
            createdAt: ratingData.createdAt.toDate(),
            updatedAt: ratingData.updatedAt.toDate()
          } as ChantRating);
        });

        setRatings(loadedRatings);

        // Find user's rating if they've rated
        if (currentUser) {
          const userRatingDoc = loadedRatings.find(r => r.userId === currentUser.id);
          if (userRatingDoc) {
            setUserRating(userRatingDoc.rating);
            setComment(userRatingDoc.comment || '');
          }
        }
      } else {
        toast.error('Chant not found');
      }
    } catch (error) {
      console.error('Error loading chant:', error);
      toast.error('Unable to load chant details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !chant || !userRating) return;

    try {
      const ratingData = {
        chantId: chant.id,
        userId: currentUser.id,
        rating: userRating,
        comment: comment.trim() || null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await addDoc(collection(db, 'chant_ratings'), ratingData);
      toast.success('Rating submitted successfully');
      loadChantData(); // Reload to get updated ratings
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      </div>
    );
  }

  if (!chant) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Chant not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/chants"
          className="flex items-center gap-2 text-brand-primary hover:opacity-90"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Chants
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{chant.title}</h1>
            <span className="inline-block px-3 py-1 bg-brand-gradient text-white text-sm rounded-full">
              {chant.category.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span className="text-lg font-medium">{chant.avgRating.toFixed(1)}</span>
            <span className="text-gray-500">({chant.totalRatings})</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Lyrics</h2>
            <pre className="whitespace-pre-wrap text-gray-600 font-sans">{chant.lyrics}</pre>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Rhythm & Timing</h2>
              <p className="text-gray-600">{chant.rhythm}</p>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-5 h-5" />
                <span>
                  {chant.minPeople} {chant.maxPeople ? `- ${chant.maxPeople}` : '+'} people
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-5 h-5" />
                <span>Difficulty: {chant.difficulty}</span>
              </div>
            </div>

            {chant.gameSituation && (
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Best Used When</h3>
                <p className="text-gray-600">{chant.gameSituation}</p>
              </div>
            )}
          </div>
        </div>

        {/* Rating Section */}
        <div className="border-t pt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Ratings & Reviews</h2>
          
          {currentUser && (
            <form onSubmit={handleRatingSubmit} className="mb-8">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setUserRating(rating)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          rating <= userRating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                  placeholder="Share your thoughts about this chant..."
                />
              </div>

              <button
                type="submit"
                disabled={!userRating}
                className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Rating
              </button>
            </form>
          )}

          <div className="space-y-6">
            {ratings.length > 0 ? (
              ratings.map((rating) => (
                <div key={rating.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= rating.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  {rating.comment && (
                    <p className="text-gray-600">{rating.comment}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    {rating.createdAt.toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No ratings yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChantDetailPage;