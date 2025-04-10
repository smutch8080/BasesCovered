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