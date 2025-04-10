import React, { useEffect, useState } from 'react';
import { Calendar, Users, Award, Clock } from 'lucide-react';
import { VolunteerStats, VolunteerHistory, VolunteerSlot } from '../../types/volunteer';
import { VolunteerSlotsList } from './VolunteerSlotsList';
import { VolunteerHistoryList } from './VolunteerHistoryList';
import { VolunteerStatsCard } from './VolunteerStatsCard';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, onSnapshot, orderBy, Timestamp, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';

export const VolunteerDashboard: React.FC = () => {
  const [stats, setStats] = useState<VolunteerStats | null>(null);
  const [history, setHistory] = useState<VolunteerHistory[]>([]);
  const [availableSlots, setAvailableSlots] = useState<VolunteerSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    setIsLoading(true);
    setError(null);

    // Set up listeners for stats, history, and available slots
    const unsubscribeStats = onSnapshot(
      query(
        collection(db, 'volunteer_stats'),
        where('userId', '==', currentUser.id)
      ),
      {
        next: (snapshot) => {
          if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            setStats({
              ...data,
              id: snapshot.docs[0].id,
              lastVolunteered: data.lastVolunteered?.toDate(),
              updatedAt: data.updatedAt.toDate()
            } as VolunteerStats);
          }
        },
        error: (error) => {
          console.error('Error in stats listener:', error);
          toast.error('Unable to load volunteer statistics');
        }
      }
    );

    // Load available volunteer slots
    const loadAvailableSlots = async () => {
      try {
        const now = new Date();
        const eventsRef = collection(db, 'events');
        const eventsQuery = query(
          eventsRef,
          where('startDate', '>=', now),
          orderBy('startDate', 'asc')
        );
        
        const eventsSnapshot = await getDocs(eventsQuery);
        const slots: VolunteerSlot[] = [];
        
        eventsSnapshot.forEach(doc => {
          const eventData = doc.data();
          if (eventData.volunteerSlots) {
            eventData.volunteerSlots.forEach((slot: any) => {
              if (slot.status === 'open' || slot.assignedVolunteerId === currentUser.id) {
                slots.push({
                  ...slot,
                  eventId: doc.id,
                  eventName: eventData.title,
                  startTime: slot.startTime.toDate(),
                  endTime: slot.endTime.toDate(),
                  createdAt: slot.createdAt.toDate(),
                  updatedAt: slot.updatedAt.toDate()
                });
              }
            });
          }
        });

        setAvailableSlots(slots);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading available slots:', error);
        toast.error('Unable to load volunteer opportunities');
      }
    };

    loadAvailableSlots();

    // Cleanup listeners
    return () => {
      unsubscribeStats();
    };
  }, [currentUser]);

  const handleVolunteer = async (slotId: string) => {
    if (!currentUser) return;

    try {
      // Find the slot and event
      const slot = availableSlots.find(s => s.id === slotId);
      if (!slot) return;

      // Update the slot
      const updatedSlot = {
        ...slot,
        assignedVolunteerId: currentUser.id,
        assignedVolunteerName: currentUser.displayName,
        status: 'filled' as const,
        updatedAt: new Date()
      };

      // Update slots state
      setAvailableSlots(prev => 
        prev.map(s => s.id === slotId ? updatedSlot : s)
      );

      toast.success('Successfully signed up for volunteer role');
    } catch (error) {
      console.error('Error volunteering for slot:', error);
      toast.error('Failed to sign up for volunteer role');
    }
  };

  const handleCancelVolunteer = async (slotId: string) => {
    try {
      // Find the slot and event
      const slot = availableSlots.find(s => s.id === slotId);
      if (!slot) return;

      // Update the slot
      const updatedSlot = {
        ...slot,
        assignedVolunteerId: undefined,
        assignedVolunteerName: undefined,
        status: 'open' as const,
        updatedAt: new Date()
      };

      // Update slots state
      setAvailableSlots(prev => 
        prev.map(s => s.id === slotId ? updatedSlot : s)
      );

      toast.success('Successfully cancelled volunteer signup');
    } catch (error) {
      console.error('Error cancelling volunteer slot:', error);
      toast.error('Failed to cancel signup');
    }
  };

  if (error) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow-md">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      {stats && <VolunteerStatsCard stats={stats} />}

      {/* Available Opportunities */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Available Opportunities</h2>
        <VolunteerSlotsList
          slots={availableSlots}
          onVolunteer={handleVolunteer}
          onCancelVolunteer={handleCancelVolunteer}
        />
      </div>

      {/* Volunteer History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
        <VolunteerHistoryList history={history} />
      </div>
    </div>
  );
};