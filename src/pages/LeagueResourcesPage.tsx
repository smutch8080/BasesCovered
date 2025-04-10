import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LeagueResource } from '../types/resources';
import { Team } from '../types/team';
import { useAuth } from '../contexts/AuthContext';
import { LeagueResourcesSection } from '../components/leagues/resources/LeagueResourcesSection';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

function LeagueResourcesPage() {
  const { leagueId } = useParams();
  const [resources, setResources] = useState<LeagueResource[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadLeagueData = async () => {
      if (!leagueId || !currentUser) return;

      try {
        setIsLoading(true);
        console.log('Loading league resources for:', leagueId);

        // First verify league access
        const leaguesRef = collection(db, 'leagues');
        const leagueQuery = query(
          leaguesRef,
          where('managers', 'array-contains', currentUser.id)
        );
        
        const leagueSnapshot = await getDocs(leagueQuery);
        if (leagueSnapshot.empty) {
          console.error('League access denied');
          toast.error('You do not have access to this league');
          return;
        }

        // Load teams
        const teamsRef = collection(db, 'teams');
        const teamsQuery = query(
          teamsRef,
          where('leagueId', '==', leagueId),
          orderBy('name')
        );
        
        const teamsSnapshot = await getDocs(teamsQuery);
        const loadedTeams: Team[] = [];
        
        teamsSnapshot.forEach(doc => {
          const data = doc.data();
          loadedTeams.push({
            ...data,
            id: doc.id,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          } as Team);
        });
        
        setTeams(loadedTeams);

        // Load resources
        const resourcesRef = collection(db, 'league_resources');
        const resourcesQuery = query(
          resourcesRef,
          where('leagueId', '==', leagueId),
          orderBy('createdAt', 'desc')
        );
        
        const resourcesSnapshot = await getDocs(resourcesQuery);
        const loadedResources: LeagueResource[] = [];
        
        resourcesSnapshot.forEach(doc => {
          const data = doc.data();
          loadedResources.push({
            ...data,
            id: doc.id,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          } as LeagueResource);
        });
        
        setResources(loadedResources);
      } catch (error) {
        console.error('Error loading league resources:', error);
        toast.error('Unable to load league resources');
      } finally {
        setIsLoading(false);
      }
    };

    loadLeagueData();
  }, [leagueId, currentUser]);

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Please sign in to view league resources</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/league-dashboard"
          className="flex items-center gap-2 text-brand-primary hover:opacity-90"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to League Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">League Resources</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      ) : (
        <LeagueResourcesSection
          leagueId={leagueId!}
          resources={resources}
          teams={teams}
          onResourceAdded={(resource) => {
            setResources(prev => [resource, ...prev]);
            toast.success('Resource added successfully');
          }}
          onResourceUpdated={(resource) => {
            setResources(prev => prev.map(r => 
              r.id === resource.id ? resource : r
            ));
            toast.success('Resource updated successfully');
          }}
          onResourceDeleted={(resourceId) => {
            setResources(prev => prev.filter(r => r.id !== resourceId));
            toast.success('Resource deleted successfully');
          }}
        />
      )}
    </div>
  );
}

export default LeagueResourcesPage;