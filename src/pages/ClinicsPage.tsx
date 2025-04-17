import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Clinic } from '../types/clinic';
import { useAuth } from '../contexts/AuthContext';
import { ClinicCard } from '../components/clinics/ClinicCard';
import { LocationAutocomplete } from '../components/teams/LocationAutocomplete';
import { Calendar, Plus, Search, Filter, Users } from 'lucide-react';
import toast from 'react-hot-toast';

function ClinicsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();
  const isCoach = currentUser?.role === 'coach' || currentUser?.role === 'admin';

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('');
  const [location, setLocation] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  useEffect(() => {
    const loadClinics = async () => {
      try {
        setIsLoading(true);
        const clinicsRef = collection(db, 'clinics');
        const q = query(
          clinicsRef,
          where('status', '==', 'published'),
          orderBy('startDate', 'asc')
        );
        
        const querySnapshot = await getDocs(q);
        const loadedClinics: Clinic[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          loadedClinics.push({
            ...data,
            id: doc.id,
            startDate: data.startDate.toDate(),
            endDate: data.endDate.toDate(),
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          } as Clinic);
        });

        setClinics(loadedClinics);
      } catch (error) {
        console.error('Error loading clinics:', error);
        toast.error('Unable to load clinics');
      } finally {
        setIsLoading(false);
      }
    };

    loadClinics();
  }, []);

  const filteredClinics = clinics.filter(clinic => {
    const matchesSearch = clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAgeGroup = !selectedAgeGroup || clinic.ageGroup === selectedAgeGroup;
    const matchesSkillLevel = !selectedSkillLevel || clinic.skillLevel === selectedSkillLevel;
    
    const matchesLocation = !location?.city || 
      clinic.location.address.toLowerCase().includes(location.city.toLowerCase());

    const matchesDateRange = (!dateRange.start || new Date(clinic.startDate) >= new Date(dateRange.start)) &&
      (!dateRange.end || new Date(clinic.endDate) <= new Date(dateRange.end));

    return matchesSearch && matchesAgeGroup && matchesSkillLevel && matchesLocation && matchesDateRange;
  });

  return (
    <div>
      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        <img 
          src="/assets/images/Elite Clinic/0dd63d4068181d49a7a4c65757a30b19-large.jpeg" 
          alt="Clinic management"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Manage Your Clinics
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Create, organize, and track your softball clinics all in one place
            </p>
            {isCoach && (
              <Link
                to="/clinics/new"
                className="inline-flex items-center px-8 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Clinic
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Feature Sections */}
        <div className="space-y-16 mb-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <img 
                src="/assets/images/Elite Clinic/0cb03b9a9a3b8821d421a240f728439b-large.jpeg" 
                alt="Clinic organization"
                className="rounded-lg shadow-md w-full h-[400px] object-cover"
              />
            </div>
            <div className="md:w-1/2 space-y-4">
              <h2 className="text-3xl font-bold text-gray-800">Streamlined Organization</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Manage your clinics with ease using our intuitive dashboard. Track registrations, 
                monitor attendance, and keep all your clinic details in one organized space.
              </p>
              {isCoach && (
                <Link
                  to="/clinics/new"
                  className="inline-flex items-center px-6 py-3 bg-brand-primary text-white rounded-lg
                    hover:bg-opacity-90 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Clinic
                </Link>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row-reverse items-center gap-8">
            <div className="md:w-1/2">
              <img 
                src="/assets/images/Elite Clinic/06d78a5b38664efe0815edb9fe0f2aaf-large.jpeg" 
                alt="Clinic management dashboard"
                className="rounded-lg shadow-md w-full h-[400px] object-cover"
              />
            </div>
            <div className="md:w-1/2 space-y-4">
              <h2 className="text-3xl font-bold text-gray-800">Powerful Management Tools</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Access comprehensive analytics, participant data, and scheduling tools. 
                Make data-driven decisions to improve your clinic offerings and participant experience.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <Calendar className="w-8 h-8 text-brand-primary mb-2" />
                  <h3 className="font-semibold mb-1">Smart Scheduling</h3>
                  <p className="text-sm text-gray-600">Automated calendar management and reminders</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <Users className="w-8 h-8 text-brand-primary mb-2" />
                  <h3 className="font-semibold mb-1">Attendance Tracking</h3>
                  <p className="text-sm text-gray-600">Real-time participant management</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search clinics..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              />
            </div>
            
            <div className="flex-1">
              <LocationAutocomplete
                value={location}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age Group
                </label>
                <select
                  value={selectedAgeGroup}
                  onChange={(e) => setSelectedAgeGroup(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="">All Ages</option>
                  <option value="8U">8U</option>
                  <option value="10U">10U</option>
                  <option value="12U">12U</option>
                  <option value="14U">14U</option>
                  <option value="16U">16U</option>
                  <option value="18U">18U</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skill Level
                </label>
                <select
                  value={selectedSkillLevel}
                  onChange={(e) => setSelectedSkillLevel(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
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
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
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
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>
          )}
        </div>

        {/* Clinic Cards */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading clinics...</p>
          </div>
        ) : filteredClinics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClinics.map((clinic) => (
              <ClinicCard key={clinic.id} clinic={clinic} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No Clinics Found</h2>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedAgeGroup || selectedSkillLevel || location
                ? 'Try adjusting your search filters'
                : 'No upcoming clinics available at this time'}
            </p>
            {isCoach && (
              <Link
                to="/clinics/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-lg
                  hover:opacity-90 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Your First Clinic
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ClinicsPage;