import React, { useState } from 'react';
import { collection, query, where, getDocs, and, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Team, Location, AgeDivision, TeamType } from '../types/team';
import { LocationAutocomplete } from '../components/teams/LocationAutocomplete';
import { TeamSearchCard } from '../components/teams/TeamSearchCard';
import { Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageLayout } from '../components/layout/PageLayout';

function FindTeamsPage() {
  const [location, setLocation] = useState<Location | null>(null);
  const [teams, setTeams] = useState<(Team & { coachName?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<AgeDivision | ''>('');
  const [selectedType, setSelectedType] = useState<TeamType | ''>('');
  const [sortBy, setSortBy] = useState<'name' | 'updated'>('updated');
  const [showFilters, setShowFilters] = useState(true);

  const handleSearch = async () => {
    if (!location?.city || !location?.state) {
      toast.error('Please select a location');
      return;
    }

    try {
      setIsLoading(true);
      const teamsRef = collection(db, 'teams');
      
      // Build query constraints
      const constraints = [
        where('location.city', '==', location.city),
        where('location.state', '==', location.state)
      ];

      if (selectedDivision) {
        constraints.push(where('ageDivision', '==', selectedDivision));
      }

      if (selectedType) {
        constraints.push(where('type', '==', selectedType));
      }

      // Add sorting
      const orderByField = sortBy === 'name' ? 'name' : 'updatedAt';
      
      const q = query(
        teamsRef,
        and(...constraints),
        orderBy(orderByField, orderByField === 'name' ? 'asc' : 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const foundTeams: (Team & { coachName?: string })[] = [];
      
      // Load teams and coach names in parallel
      await Promise.all(querySnapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        
        // Get coach name
        let coachName = 'Unknown Coach';
        try {
          const coachDoc = await getDoc(doc(db, 'users', data.coachId));
          if (coachDoc.exists()) {
            coachName = coachDoc.data().displayName;
          }
        } catch (error) {
          console.error('Error loading coach name:', error);
        }

        foundTeams.push({
          ...data,
          id: docSnapshot.id,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          joinRequests: data.joinRequests || [],
          coachName
        } as Team & { coachName: string });
      }));

      setTeams(foundTeams);
      setHasSearched(true);
    } catch (error) {
      console.error('Error searching teams:', error);
      toast.error('Failed to search teams');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter teams by name search term
  const filteredTeams = teams.filter(team => 
    !searchTerm || team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageLayout className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Find Teams</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <LocationAutocomplete
                  value={location || undefined}
                  onChange={setLocation}
                />
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search teams by name..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border rounded-lg
                  hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>
              <button
                onClick={handleSearch}
                disabled={isLoading || !location?.city || !location?.state}
                className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90
                  disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age Division
                  </label>
                  <select
                    value={selectedDivision}
                    onChange={(e) => setSelectedDivision(e.target.value as AgeDivision | '')}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="">All Divisions</option>
                    {Object.values(AgeDivision).map((division) => (
                      <option key={division} value={division}>{division}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as TeamType | '')}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="">All Types</option>
                    {Object.values(TeamType).map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'updated')}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="updated">Recently Updated</option>
                    <option value="name">Team Name</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
            <p className="text-gray-600 mt-4">Searching teams...</p>
          </div>
        ) : hasSearched ? (
          filteredTeams.length > 0 ? (
            <>
              <div className="mb-4 text-gray-600">
                Found {filteredTeams.length} team{filteredTeams.length !== 1 ? 's' : ''} in {location?.city}, {location?.state}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeams.map((team) => (
                  <TeamSearchCard key={team.id} team={team} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No teams found in {location?.city}, {location?.state}</p>
              {(selectedDivision || selectedType || searchTerm) && (
                <p className="text-gray-500 mt-2">
                  Try adjusting your filters to see more results
                </p>
              )}
            </div>
          )
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Enter a location to search for teams</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

export default FindTeamsPage;