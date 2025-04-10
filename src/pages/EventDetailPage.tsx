import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Event, RSVPStatus } from '../types/events';
import { VolunteerRole, VolunteerSlot } from '../types/volunteer';
import { useAuth } from '../contexts/AuthContext';
import { EventVolunteerSection } from '../components/events/EventVolunteerSection';
import { fetchVolunteerRoles } from '../services/volunteers';
import { Calendar, Clock, MapPin, Users, ArrowLeft, ClipboardList } from 'lucide-react';
import { formatDate, formatTime } from '../utils/dateUtils';
import { PracticePlanSelector } from '../components/events/PracticePlanSelector';
import toast from 'react-hot-toast';

function EventDetailPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [roles, setRoles] = useState<VolunteerRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPlanSelector, setShowPlanSelector] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadEvent = async () => {
      if (!eventId) return;

      try {
        setIsLoading(true);
        const eventDoc = await getDoc(doc(db, 'events', eventId));
        
        if (eventDoc.exists()) {
          const data = eventDoc.data();
          const eventData = {
            ...data,
            id: eventDoc.id,
            startDate: data.startDate.toDate(),
            endDate: data.endDate.toDate(),
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            rsvps: data.rsvps || [],
            volunteerSlots: (data.volunteerSlots || []).map((slot: any) => ({
              ...slot,
              startTime: slot.startTime.toDate(),
              endTime: slot.endTime.toDate(),
              createdAt: slot.createdAt.toDate(),
              updatedAt: slot.updatedAt.toDate()
            }))
          } as Event;

          setEvent(eventData);

          // Load volunteer roles if team event
          if (data.teamId) {
            const teamRoles = await fetchVolunteerRoles(data.teamId);
            setRoles(teamRoles);
          }
        } else {
          toast.error('Event not found');
        }
      } catch (error) {
        console.error('Error loading event:', error);
        toast.error('Unable to load event details');
      } finally {
        setIsLoading(false);
      }
    };

    loadEvent();
  }, [eventId]);

  const handleRSVP = async (status: RSVPStatus) => {
    if (!currentUser || !event) return;

    try {
      const userRSVP = {
        userId: currentUser.id,
        userName: currentUser.displayName,
        userRole: currentUser.role,
        status,
        timestamp: new Date()
      };

      const updatedRSVPs = event.rsvps
        .filter(rsvp => rsvp.userId !== currentUser.id)
        .concat(userRSVP);

      const eventRef = doc(db, 'events', event.id);
      await updateDoc(eventRef, {
        rsvps: updatedRSVPs,
        updatedAt: Timestamp.now()
      });

      setEvent(prev => prev ? {
        ...prev,
        rsvps: updatedRSVPs,
        updatedAt: new Date()
      } : null);

      toast.success('RSVP updated successfully');
    } catch (error) {
      console.error('Error updating RSVP:', error);
      toast.error('Failed to update RSVP');
    }
  };

  const handleAddVolunteerSlot = async (slotData: Omit<VolunteerSlot, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!event) return;

    try {
      const now = new Date();
      const newSlot: VolunteerSlot = {
        ...slotData,
        id: Math.random().toString(),
        createdAt: now,
        updatedAt: now
      };

      const eventRef = doc(db, 'events', event.id);
      await updateDoc(eventRef, {
        volunteerSlots: [...(event.volunteerSlots || []), {
          ...newSlot,
          startTime: Timestamp.fromDate(newSlot.startTime),
          endTime: Timestamp.fromDate(newSlot.endTime),
          createdAt: Timestamp.fromDate(newSlot.createdAt),
          updatedAt: Timestamp.fromDate(newSlot.updatedAt)
        }],
        updatedAt: Timestamp.now()
      });

      setEvent(prev => prev ? {
        ...prev,
        volunteerSlots: [...(prev.volunteerSlots || []), newSlot],
        updatedAt: now
      } : null);

      toast.success('Volunteer slot added successfully');
    } catch (error) {
      console.error('Error adding volunteer slot:', error);
      toast.error('Failed to add volunteer slot');
    }
  };

  const handleRemoveVolunteerSlot = async (slotId: string) => {
    if (!event) return;

    try {
      const updatedSlots = event.volunteerSlots?.filter(slot => slot.id !== slotId) || [];

      const eventRef = doc(db, 'events', event.id);
      await updateDoc(eventRef, {
        volunteerSlots: updatedSlots.map(slot => ({
          ...slot,
          startTime: Timestamp.fromDate(slot.startTime),
          endTime: Timestamp.fromDate(slot.endTime),
          createdAt: Timestamp.fromDate(slot.createdAt),
          updatedAt: Timestamp.fromDate(slot.updatedAt)
        })),
        updatedAt: Timestamp.now()
      });

      setEvent(prev => prev ? {
        ...prev,
        volunteerSlots: updatedSlots,
        updatedAt: new Date()
      } : null);

      toast.success('Volunteer slot removed successfully');
    } catch (error) {
      console.error('Error removing volunteer slot:', error);
      toast.error('Failed to remove volunteer slot');
    }
  };

  const handleVolunteerSlotUpdate = async (updatedSlot: VolunteerSlot) => {
    if (!event) return;

    try {
      const updatedSlots = event.volunteerSlots?.map(slot =>
        slot.id === updatedSlot.id ? updatedSlot : slot
      ) || [];

      const eventRef = doc(db, 'events', event.id);
      await updateDoc(eventRef, {
        volunteerSlots: updatedSlots.map(slot => ({
          ...slot,
          startTime: Timestamp.fromDate(slot.startTime),
          endTime: Timestamp.fromDate(slot.endTime),
          createdAt: Timestamp.fromDate(slot.createdAt),
          updatedAt: Timestamp.fromDate(slot.updatedAt)
        })),
        updatedAt: Timestamp.now()
      });

      setEvent(prev => prev ? {
        ...prev,
        volunteerSlots: updatedSlots,
        updatedAt: new Date()
      } : null);

      toast.success('Volunteer slot updated successfully');
    } catch (error) {
      console.error('Error updating volunteer slot:', error);
      toast.error('Failed to update volunteer slot');
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

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Event not found</p>
      </div>
    );
  }

  const isEventCoach = currentUser && (
    currentUser.id === event.createdBy || 
    currentUser.role === 'admin'
  );

  const userRSVP = currentUser
    ? event.rsvps.find(rsvp => rsvp.userId === currentUser.id)?.status
    : undefined;

  const goingCount = event.rsvps.filter(rsvp => rsvp.status === RSVPStatus.Going).length;
  const maybeCount = event.rsvps.filter(rsvp => rsvp.status === RSVPStatus.Maybe).length;
  const notGoingCount = event.rsvps.filter(rsvp => rsvp.status === RSVPStatus.NotGoing).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/events"
          className="flex items-center gap-2 text-brand-primary hover:opacity-90"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Events
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Event Details */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="inline-block px-3 py-1 text-sm font-medium text-white bg-brand-gradient rounded-full mb-2">
              {event.type}
            </span>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{event.title}</h1>
            {event.teamName && !event.isCommunityEvent && (
              <p className="text-brand-primary">{event.teamName}</p>
            )}
          </div>
          {event.cost && (
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-800">${event.cost}</span>
              {event.requiresPayment && (
                <p className="text-sm text-gray-600">Payment required</p>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-600">
              <Calendar className="w-5 h-5" />
              <span>{formatDate(event.startDate)}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Clock className="w-5 h-5" />
              <span>{formatTime(event.startDate)} - {formatTime(event.endDate)}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <MapPin className="w-5 h-5" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Users className="w-5 h-5" />
              <div>
                <p>{goingCount} going • {maybeCount} maybe • {notGoingCount} not going</p>
                {event.maxParticipants && (
                  <p className="text-sm">
                    {event.maxParticipants - goingCount} spots remaining
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {event.description && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Description</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
              </div>
            )}

            {event.requiresPayment && event.paymentDetails && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Payment Details</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{event.paymentDetails}</p>
              </div>
            )}

            {event.type === 'Practice' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Practice Plan</h2>
                {event.practicePlanId ? (
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/practice-plan/${event.practicePlanId}`}
                      className="flex items-center gap-2 text-brand-primary hover:opacity-90"
                    >
                      <ClipboardList className="w-4 h-4" />
                      {event.practicePlanName}
                    </Link>
                    {isEventCoach && (
                      <button
                        onClick={() => setShowPlanSelector(true)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        Change Plan
                      </button>
                    )}
                  </div>
                ) : isEventCoach ? (
                  <button
                    onClick={() => setShowPlanSelector(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90"
                  >
                    <ClipboardList className="w-4 h-4" />
                    Attach Practice Plan
                  </button>
                ) : (
                  <p className="text-gray-500">No practice plan attached</p>
                )}
              </div>
            )}
          </div>
        </div>

        {currentUser && (
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Your RSVP</h2>
            <div className="flex gap-3">
              <button
                onClick={() => handleRSVP(RSVPStatus.Going)}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  userRSVP === RSVPStatus.Going
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Going
              </button>
              <button
                onClick={() => handleRSVP(RSVPStatus.Maybe)}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  userRSVP === RSVPStatus.Maybe
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Maybe
              </button>
              <button
                onClick={() => handleRSVP(RSVPStatus.NotGoing)}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  userRSVP === RSVPStatus.NotGoing
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Not Going
              </button>
            </div>
          </div>
        )}

        <div className="border-t mt-8 pt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Responses</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Going ({goingCount})</h3>
              <div className="space-y-2">
                {event.rsvps
                  .filter(rsvp => rsvp.status === RSVPStatus.Going)
                  .map(rsvp => (
                    <div key={rsvp.userId} className="text-sm text-gray-600">
                      {rsvp.userName}
                    </div>
                  ))
                }
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Maybe ({maybeCount})</h3>
              <div className="space-y-2">
                {event.rsvps
                  .filter(rsvp => rsvp.status === RSVPStatus.Maybe)
                  .map(rsvp => (
                    <div key={rsvp.userId} className="text-sm text-gray-600">
                      {rsvp.userName}
                    </div>
                  ))
                }
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Not Going ({notGoingCount})</h3>
              <div className="space-y-2">
                {event.rsvps
                  .filter(rsvp => rsvp.status === RSVPStatus.NotGoing)
                  .map(rsvp => (
                    <div key={rsvp.userId} className="text-sm text-gray-600">
                      {rsvp.userName}
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Volunteer Section */}
      {event.teamId && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <EventVolunteerSection
            eventId={event.id}
            slots={event.volunteerSlots || []}
            roles={roles}
            onSlotUpdate={handleVolunteerSlotUpdate}
            onAddSlot={handleAddVolunteerSlot}
            onRemoveSlot={handleRemoveVolunteerSlot}
            isEditable={isEventCoach}
            eventStartTime={event.startDate}
            eventEndTime={event.endDate}
          />
        </div>
      )}

      {isEventCoach && event.type === 'Practice' && (
        <PracticePlanSelector
          isOpen={showPlanSelector}
          onClose={() => setShowPlanSelector(false)}
          event={event}
          onEventUpdated={setEvent}
        />
      )}
    </div>
  );
}

export default EventDetailPage;