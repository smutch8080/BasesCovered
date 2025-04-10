import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Event } from '../../types/events';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, ChevronRight } from 'lucide-react';
import { EventsCalendar } from '../calendar/EventsCalendar';
import { fetchEvents } from '../../services/events';
import toast from 'react-hot-toast';

export const UpcomingEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        const loadedEvents = await fetchEvents(currentUser, false);
        
        // Sort events by date
        const sortedEvents = loadedEvents.sort((a, b) => 
          a.startDate.getTime() - b.startDate.getTime()
        );
        
        setEvents(sortedEvents);
      } catch (error) {
        console.error('Error loading upcoming events:', error);
        toast.error('Unable to load upcoming events');
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading events...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-brand-primary" />
          <h2 className="text-2xl font-bold text-gray-800">Upcoming Events</h2>
        </div>
        <Link
          to="/events"
          className="flex items-center gap-1 text-brand-primary hover:opacity-90"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <EventsCalendar 
        events={events}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        onEventClick={(event) => {
          window.location.href = `/events/${event.id}`;
        }}
      />
    </div>
  );
};