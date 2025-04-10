import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Search, MapPin, Filter, ChevronRight, Users } from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Event, EventType } from '../types/events';
import { EventCard } from '../components/events/EventCard';
import { LocationAutocomplete } from '../components/teams/LocationAutocomplete';
import { Location } from '../types/team';
import { Footer } from '../components/Footer';
import toast from 'react-hot-toast';
import { CalendarSubscription } from '../components/events/CalendarSubscription';

function PublicEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<EventType | 'all'>('all');
  const [location, setLocation] = useState<Location | null>(null);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const eventsRef = collection(db, 'events');
      const now = new Date();
      
      const q = query(
        eventsRef,
        where('isCommunityEvent', '==', true),
        where('startDate', '>=', now),
        orderBy('startDate', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const loadedEvents: Event[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        loadedEvents.push({
          ...data,
          id: doc.id,
          startDate: data.startDate.toDate(),
          endDate: data.endDate.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          rsvps: data.rsvps || []
        } as Event);
      });

      setEvents(loadedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Unable to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || event.type === selectedType;
    
    const matchesLocation = !location?.city || 
      event.location.toLowerCase().includes(location.city.toLowerCase());
    
    const matchesDateRange = (!dateRange.start || new Date(event.startDate) >= new Date(dateRange.start)) &&
      (!dateRange.end || new Date(event.startDate) <= new Date(dateRange.end));

    return matchesSearch && matchesType && matchesLocation && matchesDateRange;
  });

  const tryoutEvents = events.filter(event => event.type === EventType.Tryout);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-brand-gradient text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Community Softball Events</h1>
            <p className="text-xl mb-8">
              Discover local softball events, clinics, tryouts, and more in your area
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-primary rounded-lg
                hover:bg-opacity-90 transition-colors"
            >
              <Users className="w-5 h-5" />
              Join Our Community
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search events..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              />
            </div>
            
            <LocationAutocomplete
              value={location || undefined}
              onChange={setLocation}
            />

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border rounded-lg
                hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as EventType | 'all')}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="all">All Types</option>
                  {Object.values(EventType).map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  min={dateRange.start}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>
          )}
        </div>

        {/* Tryouts Section */}
        {tryoutEvents.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Upcoming Tryouts</h2>
              <Link
                to="/register"
                className="flex items-center gap-2 text-brand-primary hover:opacity-90"
              >
                View All Tryouts
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tryoutEvents.slice(0, 3).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* All Events Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">All Events</h2>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading events...</p>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="space-y-6">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Events Found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedType !== 'all' || location || dateRange.start || dateRange.end
                  ? 'Try adjusting your search filters'
                  : 'No upcoming community events at this time'}
              </p>
            </div>
          )}
        </div>

        {/* Calendar Subscription */}
        <div className="mt-12">
          <CalendarSubscription events={events} />
        </div>

      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default PublicEventsPage;