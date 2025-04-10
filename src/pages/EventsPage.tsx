import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Event, EventType } from '../types/events';
import { useAuth } from '../contexts/AuthContext';
import { EventCard } from '../components/events/EventCard';
import { NewEventDialog } from '../components/events/NewEventDialog';
import { Calendar, Plus, Filter } from 'lucide-react';
import { fetchEvents } from '../services/events';
import { rolePermissions } from '../types/permissions/roles';
import { CTADisplay } from '../components/cta/CTADisplay';
import toast from 'react-hot-toast';
import { CalendarSubscription } from '../components/events/CalendarSubscription';
import { PageLayout } from '../components/layout/PageLayout';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewEventDialog, setShowNewEventDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<EventType | 'all'>('all');
  const [showPastEvents, setShowPastEvents] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const loadedEvents = await fetchEvents(currentUser, showPastEvents);
        setEvents(loadedEvents);
      } catch (error) {
        console.error('Error loading events:', error);
        setError('Unable to load events. Please try again later.');
        toast.error('Unable to load events');
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [currentUser, showPastEvents]);

  const filteredEvents = events.filter(event => {
    if (selectedType === 'all') return true;
    return event.type === selectedType;
  });

  const canCreateEvents = currentUser && rolePermissions[currentUser.role].canCreateEvents;

  return (
    <PageLayout className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-brand-primary" />
            <h1 className="text-3xl font-bold text-gray-800">Events</h1>
          </div>

          {canCreateEvents && (
            <button
              onClick={() => setShowNewEventDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
                hover:opacity-90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Event
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as EventType | 'all')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              >
                <option value="all">All Event Types</option>
                {Object.values(EventType).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showPastEvents}
                  onChange={(e) => setShowPastEvents(e.target.checked)}
                  className="rounded text-brand-primary focus:ring-brand-primary"
                />
                <span className="text-gray-700">Show past events</span>
              </label>
            </div>
          </div>
        </div>
        {/* Add this after the header section */}
        <CTADisplay locationId="events" className="mb-8" />

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading events...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            {error}
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="space-y-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No Events Found</h2>
            <p className="text-gray-600 mb-6">
              {showPastEvents || selectedType !== 'all'
                ? 'Try adjusting your filters'
                : 'No upcoming events scheduled'}
            </p>
            {canCreateEvents && (
              <button
                onClick={() => setShowNewEventDialog(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-lg
                  hover:opacity-90 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create First Event
              </button>
            )}
          </div>
        )}

        {canCreateEvents && (
          <NewEventDialog
            isOpen={showNewEventDialog}
            onClose={() => setShowNewEventDialog(false)}
            onEventCreated={(newEvent) => {
              setEvents(prev => [...prev, newEvent].sort((a, b) => 
                a.startDate.getTime() - b.startDate.getTime()
              ));
              toast.success('Event created successfully');
            }}
          />
        )}

        {/* Calendar Subscription */}
        {filteredEvents.length > 0 && (
          <div className="mt-8">
            <CalendarSubscription 
              events={filteredEvents}
              teamId={currentUser?.teams?.[0]}
            />
          </div>
        )}
      </div>
    </PageLayout>
  );
}