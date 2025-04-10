import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { User } from '../../types/auth';
import { CoachCard } from './CoachCard';
import { ChevronRight, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export const FeaturedCoaches: React.FC = () => {
  const [coaches, setCoaches] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedCoaches = async () => {
      try {
        setIsLoading(true);
        const usersRef = collection(db, 'users');
        // First query for coaches/admins
        const q = query(
          usersRef,
          where('role', 'in', ['coach', 'admin']),
          orderBy('displayName'),
          limit(10)
        );
        
        const querySnapshot = await getDocs(q);
        const loadedCoaches: User[] = [];
        
        // Filter public profiles in memory
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.coachProfile?.isPublic) {
            loadedCoaches.push({
              ...data,
              id: doc.id,
            } as User);
          }
        });

        // Take only the first 3 public profiles
        setCoaches(loadedCoaches.slice(0, 3));
      } catch (error) {
        console.error('Error loading featured coaches:', error);
        toast.error('Unable to load featured coaches');
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedCoaches();
  }, []);

  if (isLoading || coaches.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-brand-primary" />
          <h2 className="text-2xl font-bold text-gray-800">Featured Coaches</h2>
        </div>
        <Link
          to="/coaches"
          className="flex items-center gap-1 text-brand-primary hover:opacity-90"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coaches.map((coach) => (
          <CoachCard key={coach.id} coach={coach} />
        ))}
      </div>
    </div>
  );
};