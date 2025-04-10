import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from '../types/auth';
import { ArrowLeft } from 'lucide-react';
import { BookServiceDialog } from '../components/coaches/BookServiceDialog';
import { CoachProfileView } from '../components/coaches/CoachProfileView';
import { ReviewsSection } from '../components/coaches/ReviewsSection';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

function CoachProfilePage() {
  const { coachId } = useParams<{ coachId: string }>();
  const [coach, setCoach] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<any>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadCoach = async () => {
      if (!coachId) return;

      try {
        setIsLoading(true);
        const coachDoc = await getDoc(doc(db, 'users', coachId));
        
        if (coachDoc.exists()) {
          const data = coachDoc.data();
          setCoach({
            ...data,
            id: coachDoc.id,
            coachProfile: {
              ...data.coachProfile,
              reviews: (data.coachProfile?.reviews || []).map((review: any) => ({
                ...review,
                createdAt: review.createdAt.toDate(),
                updatedAt: review.updatedAt.toDate()
              }))
            }
          } as User);
        } else {
          toast.error('Coach not found');
        }
      } catch (error) {
        console.error('Error loading coach:', error);
        toast.error('Unable to load coach profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadCoach();
  }, [coachId]);

  const handleBookService = (service: any) => {
    if (!currentUser) {
      toast.error('Please sign in to book a service');
      return;
    }
    setSelectedService(service);
  };

  const handleSubmitReview = async (data: { rating: number; comment: string; serviceType?: string }) => {
    if (!currentUser || !coach || !coach.coachProfile) return;

    try {
      const newReview = {
        id: Math.random().toString(),
        authorId: currentUser.id,
        authorName: currentUser.displayName,
        rating: data.rating,
        comment: data.comment,
        serviceType: data.serviceType,
        verified: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const coachRef = doc(db, 'users', coach.id);
      await updateDoc(coachRef, {
        'coachProfile.reviews': arrayUnion(newReview)
      });

      // Update local state
      setCoach(prev => {
        if (!prev?.coachProfile) return prev;
        return {
          ...prev,
          coachProfile: {
            ...prev.coachProfile,
            reviews: [
              ...prev.coachProfile.reviews,
              {
                ...newReview,
                createdAt: newReview.createdAt.toDate(),
                updatedAt: newReview.updatedAt.toDate()
              }
            ]
          }
        };
      });

      toast.success('Review submitted successfully');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
      throw error;
    }
  };

  const canReview = currentUser && coach && currentUser.id !== coach.id;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Loading coach profile...</p>
      </div>
    );
  }

  if (!coach || !coach.coachProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Coach profile not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/coaches"
          className="flex items-center gap-2 text-brand-primary hover:opacity-90"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Coaches
        </Link>
      </div>

      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <CoachProfileView
            coach={coach}
            onBookService={handleBookService}
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <ReviewsSection
            reviews={coach.coachProfile.reviews || []}
            services={coach.coachProfile.services}
            onSubmitReview={handleSubmitReview}
            canReview={canReview}
          />
        </div>
      </div>

      {selectedService && (
        <BookServiceDialog
          isOpen={!!selectedService}
          onClose={() => setSelectedService(null)}
          coachName={coach.displayName}
          coachId={coach.id}
          service={selectedService}
        />
      )}
    </div>
  );
}

export default CoachProfilePage;