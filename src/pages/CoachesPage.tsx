import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from '../types/auth';
import { CoachCard } from '../components/coaches/CoachCard';
import { Search, MapPin, Users, Filter } from 'lucide-react';
import { LocationAutocomplete } from '../components/teams/LocationAutocomplete';
import { Location } from '../types/team';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function CoachesPage() {
  const [coaches, setCoaches] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState<Location | null>(null);
  const [selectedService, setSelectedService] = useState<string>('');
  const [experienceLevel, setExperienceLevel] = useState<string>('');
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    const loadCoaches = async () => {
      try {
        setIsLoading(true);
        const usersRef = collection(db, 'users');
        
        // Create a compound query for public coach profiles
        const coachQuery = query(
          usersRef,
          where('role', 'in', ['coach', 'admin']),
          where('coachProfile.isPublic', '==', true),
          orderBy('displayName')
        );
        
        const querySnapshot = await getDocs(coachQuery);
        const loadedCoaches: User[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Only include coaches with complete profiles
          if (data.coachProfile && data.displayName) {
            loadedCoaches.push({
              ...data,
              id: doc.id,
            } as User);
          }
        });

        setCoaches(loadedCoaches);
      } catch (error) {
        console.error('Error loading coaches:', error);
        toast.error('Unable to load coaches. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadCoaches();
  }, []);

  const filteredCoaches = coaches.filter(coach => {
    const matchesSearch = coach.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.coachProfile?.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = !location?.city || 
      coach.coachProfile?.location.city === location.city;

    const matchesService = !selectedService ||
      coach.coachProfile?.services.some(s => s.type === selectedService);

    const matchesExperience = !experienceLevel ||
      coach.coachProfile?.coachingLevel === experienceLevel;

    return matchesSearch && matchesLocation && matchesService && matchesExperience;
  });

  const availableServices = Array.from(new Set(
    coaches.flatMap(coach => 
      coach.coachProfile?.services.map(s => s.type) || []
    )
  )).sort();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Users className="w-8 h-8 text-brand-primary" />
        <h1 className="text-3xl font-bold text-gray-800">Find a Coach</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search coaches by name or bio..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          
          <div className="flex-1">
            <LocationAutocomplete
              value={location || undefined}
              onChange={setLocation}
            />
          </div>

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Type
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              >
                <option value="">All Services</option>
                {availableServices.map((service) => (
                  <option key={service} value={service}>
                    {service.charAt(0).toUpperCase() + service.slice(1)} Lessons
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              >
                <option value="">All Levels</option>
                <option value="Recreation">Recreation</option>
                <option value="Travel">Travel</option>
                <option value="High School">High School</option>
                <option value="College">College</option>
                <option value="Professional">Professional</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading coaches...</p>
        </div>
      ) : filteredCoaches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoaches.map((coach) => (
            <CoachCard key={coach.id} coach={coach} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Coaches Found</h2>
          <p className="text-gray-600 mb-6">
            Try adjusting your search criteria or location filter
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-lg
                hover:opacity-90 transition-colors"
            >
              Join as a Coach
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default CoachesPage;