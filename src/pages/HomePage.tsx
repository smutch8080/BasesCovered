import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FeaturedPlans } from '../components/FeaturedPlans';
import { FeaturedCollections } from '../components/collections/FeaturedCollections';
import { FeaturedCoaches } from '../components/coaches/FeaturedCoaches';
import { UpcomingEvents } from '../components/events/UpcomingEvents';
import { FeaturedChant } from '../components/chants/FeaturedChant';
import { getFeaturedChant } from '../services/chants';
import { Chant } from '../types/chants';
import { PageLayout } from '../components/layout/PageLayout';

export default function HomePage() {
  const { currentUser } = useAuth();
  const [featuredChant, setFeaturedChant] = useState<Chant | null>(null);
  const isCoach = currentUser?.role === 'coach' || currentUser?.role === 'admin';
  const isPlayer = currentUser?.role === 'player';

  useEffect(() => {
    const loadFeaturedChant = async () => {
      const chant = await getFeaturedChant();
      setFeaturedChant(chant);
    };

    loadFeaturedChant();
  }, []);

  // Redirect to appropriate dashboard
  if (isCoach) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isPlayer) {
    return <Navigate to="/dashboard" replace />;
  }

  // Parent/Other user view
  return (
    <PageLayout className="bg-gray-50">
      {/* Hero Banner */}
      <div className="relative h-[600px] overflow-hidden">
        <img 
          src="/assets/images/Elite Clinic/f71156e251258bde2684c1b5a65395b7-xxlarge.jpeg"
          alt="Elite Softball Training"
          className="absolute inset-0 w-full h-full object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Elite Softball Training
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Develop your skills. Build your confidence. Achieve your goals.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/clinics"
                className="px-8 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
              >
                Join a Clinic
              </a>
              <a
                href="/private-training"
                className="px-8 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Private Training
              </a>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
        {featuredChant && (
          <div className="mb-12">
            <FeaturedChant chant={featuredChant} />
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-12">
              <FeaturedCoaches />
            </div>
            <div className="mb-12">
              <FeaturedCollections />
            </div>
          </div>
          <div>
            <UpcomingEvents />
          </div>
        </div>
      </main>
    </PageLayout>
  );
}