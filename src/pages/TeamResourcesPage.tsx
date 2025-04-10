import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TeamResource } from '../types/resources';
import { useAuth } from '../contexts/AuthContext';
import { ResourcesSection } from '../components/teams/resources/ResourcesSection';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageLayout } from '../components/layout/PageLayout';

function TeamResourcesPage() {
  const { teamId } = useParams();
  const [resources, setResources] = useState<TeamResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadResources = async () => {
      if (!teamId) {
        console.log('No teamId provided');
        return;
      }

      if (!currentUser) {
        console.log('No currentUser - auth required');
        return;
      }

      try {
        setIsLoading(true);

        // First verify team access
        const teamDoc = await getDoc(doc(db, 'teams', teamId));
        if (!teamDoc.exists()) {
          console.error('Team not found:', teamId);
          toast.error('Team not found');
          return;
        }

        const teamData = teamDoc.data();
        const isTeamMember = currentUser.teams?.includes(teamId);
        const isTeamCoach = teamData.coachId === currentUser.id || teamData.coaches?.includes(currentUser.id);
        const isAdmin = currentUser.role === 'admin';

        console.log('Access check:', {
          userId: currentUser.id,
          role: currentUser.role,
          isTeamMember,
          isTeamCoach,
          isAdmin,
          teamCoachId: teamData.coachId,
          teamCoaches: teamData.coaches
        });

        if (!isTeamMember && !isTeamCoach && !isAdmin) {
          console.error('User does not have access to team');
          toast.error('You do not have access to this team');
          return;
        }

        // Load resources
        const resourcesRef = collection(db, 'team_resources');
        const q = query(
          resourcesRef,
          where('teamId', '==', teamId),
          orderBy('createdAt', 'desc')
        );

        console.log('Executing query:', {
          collection: 'team_resources',
          teamId,
          orderBy: 'createdAt'
        });

        const querySnapshot = await getDocs(q);
        console.log('Query results:', {
          empty: querySnapshot.empty,
          size: querySnapshot.size
        });

        const loadedResources: TeamResource[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log('Resource data:', {
            id: doc.id,
            teamId: data.teamId,
            createdBy: data.createdBy,
            access: data.access
          });

          // Filter resources based on access level
          const canAccess = 
            isAdmin || 
            isTeamCoach || 
            data.access.type === 'all' ||
            (data.access.type === 'coaches' && isTeamCoach) ||
            (data.access.type === 'players' && currentUser.role === 'player') ||
            (data.access.type === 'parents' && currentUser.role === 'parent');

          if (canAccess) {
            loadedResources.push({
              ...data,
              id: doc.id,
              createdAt: data.createdAt.toDate(),
              updatedAt: data.updatedAt.toDate()
            } as TeamResource);
          }
        });

        console.log('Loaded resources:', loadedResources.length);
        setResources(loadedResources);
      } catch (error: any) {
        console.error('Error loading resources:', {
          error,
          code: error.code,
          message: error.message,
          stack: error.stack
        });
        toast.error('Unable to load team resources');
      } finally {
        setIsLoading(false);
      }
    };

    loadResources();
  }, [teamId, currentUser]);

  if (!currentUser) {
    console.log('Rendering auth required message');
    return (
      <PageLayout className="bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Please sign in to view team resources</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to={`/teams/${teamId}`}
            className="flex items-center gap-2 text-brand-primary hover:opacity-90"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Team
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Team Resources</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
          </div>
        ) : (
          <ResourcesSection
            teamId={teamId!}
            resources={resources}
            onResourceAdded={(resource) => {
              console.log('Adding resource:', resource);
              setResources(prev => [resource, ...prev]);
              toast.success('Resource added successfully');
            }}
            onResourceUpdated={(resource) => {
              console.log('Updating resource:', resource);
              setResources(prev => prev.map(r => 
                r.id === resource.id ? resource : r
              ));
              toast.success('Resource updated successfully');
            }}
            onResourceDeleted={(resourceId) => {
              console.log('Deleting resource:', resourceId);
              setResources(prev => prev.filter(r => r.id !== resourceId));
              toast.success('Resource deleted successfully');
            }}
          />
        )}
      </div>
    </PageLayout>
  );
}

export default TeamResourcesPage;