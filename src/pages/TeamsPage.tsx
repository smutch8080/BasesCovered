import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Team, JoinRequest } from '../types/team';
import { NewTeamDialog } from '../components/teams/NewTeamDialog';
import { TeamCard } from '../components/teams/TeamCard';
import { PlayerTeamCard } from '../components/teams/PlayerTeamCard';
import { CTADisplay } from '../components/cta/CTADisplay';
import { Users, Plus, Search, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PageLayout } from '../components/layout/PageLayout';

function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewTeamDialog, setShowNewTeamDialog] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadTeams = async () => {
      if (!currentUser) return;

      try {
        setIsLoading(true);
        const teamsRef = collection(db, 'teams');
        const loadedTeams: Team[] = [];
        const pendingTeamRequests: JoinRequest[] = [];

        // Load teams based on role
        if (currentUser.role === 'admin') {
          // Admin can see all teams
          const q = query(teamsRef, orderBy('updatedAt', 'desc'));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach(doc => {
            loadedTeams.push(transformTeamData(doc.id, doc.data()));
          });
        } else if (currentUser.role === 'coach') {
          // Coaches see teams where they are head coach or assistant coach
          const q1 = query(teamsRef, where('coachId', '==', currentUser.id));
          const q2 = query(teamsRef, where('coaches', 'array-contains', currentUser.id));
          
          const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);

          snapshot1.forEach(doc => {
            loadedTeams.push(transformTeamData(doc.id, doc.data()));
          });

          snapshot2.forEach(doc => {
            if (!loadedTeams.some(team => team.id === doc.id)) {
              loadedTeams.push(transformTeamData(doc.id, doc.data()));
            }
          });
        } else {
          // Players and parents see teams from their user document
          const userDoc = await getDoc(doc(db, 'users', currentUser.id));
          const userTeams = userDoc.data()?.teams || [];

          if (userTeams.length > 0) {
            // Batch teams into groups of 10 (Firestore limit)
            for (let i = 0; i < userTeams.length; i += 10) {
              const batch = userTeams.slice(i, i + 10);
              const q = query(teamsRef, where('__name__', 'in', batch));
              const querySnapshot = await getDocs(q);
              
              querySnapshot.forEach(doc => {
                loadedTeams.push(transformTeamData(doc.id, doc.data()));
              });
            }
          }

          // Load pending join requests
          const pendingRequestsQuery = query(
            teamsRef,
            where('joinRequests', 'array-contains', {
              userId: currentUser.id,
              status: 'pending'
            })
          );
          const pendingSnapshot = await getDocs(pendingRequestsQuery);
          
          pendingSnapshot.forEach(doc => {
            const teamData = doc.data();
            const request = teamData.joinRequests.find(
              (r: JoinRequest) => r.userId === currentUser.id && r.status === 'pending'
            );
            if (request) {
              pendingTeamRequests.push({
                ...request,
                teamId: doc.id,
                teamName: teamData.name
              });
            }
          });
        }

        // Sort teams by updatedAt
        loadedTeams.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        setTeams(loadedTeams);
        setPendingRequests(pendingTeamRequests);
      } catch (error) {
        console.error('Error loading teams:', error);
        toast.error('Unable to load teams');
      } finally {
        setIsLoading(false);
      }
    };

    loadTeams();
  }, [currentUser]);

  const transformTeamData = (id: string, data: any): Team => {
    const location = data.location || {
      city: data.city || '',
      state: '',
      country: 'USA',
      placeId: ''
    };

    return {
      ...data,
      id,
      location,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      players: data.players || [],
      coaches: data.coaches || [],
      parents: data.parents || [],
      joinRequests: data.joinRequests || []
    } as Team;
  };

  const isCoach = currentUser?.role === 'coach' || currentUser?.role === 'admin';

  return (
    <PageLayout className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-brand-primary" />
            <h1 className="text-3xl font-bold text-gray-800">
              {isCoach ? 'My Teams' : 'Your Teams'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/teams/find"
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg
                hover:bg-gray-700 transition-colors"
            >
              <Search className="w-4 h-4" />
              Find Teams
            </Link>

            {isCoach && (
              <button
                onClick={() => setShowNewTeamDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
                  hover:opacity-90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add New Team
              </button>
            )}
          </div>
        </div>
        <CTADisplay locationId="teams" className="mb-8" />

        {/* Pending Requests Section */}
        {pendingRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Pending Team Requests</h2>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <div>
                      <h3 className="font-medium text-gray-800">{request.teamName}</h3>
                      <p className="text-sm text-yellow-600">
                        Request pending approval • {request.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading teams...</p>
          </div>
        ) : teams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              isCoach ? (
                <TeamCard key={team.id} team={team} />
              ) : (
                <PlayerTeamCard key={team.id} team={team} />
              )
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            {isCoach ? (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">No Teams Yet</h2>
                <p className="text-gray-600 mb-6">
                  Start by adding your first team to manage players and create practice plans.
                </p>
                <div className="flex justify-center gap-4">
                  <Link
                    to="/teams/find"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg
                      hover:bg-gray-700 transition-colors"
                  >
                    <Search className="w-5 h-5" />
                    Find Teams
                  </Link>
                  <button
                    onClick={() => setShowNewTeamDialog(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-lg
                      hover:opacity-90 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Add Your First Team
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Not on a Team?</h2>
                <p className="text-gray-600 mb-6">
                  Find and join a team in your area to get started.
                </p>
                <Link
                  to="/teams/find"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-lg
                    hover:opacity-90 transition-colors"
                >
                  <Search className="w-5 h-5" />
                  Find Teams
                </Link>
              </>
            )}
          </div>
        )}

        {isCoach && (
          <NewTeamDialog
            isOpen={showNewTeamDialog}
            onClose={() => setShowNewTeamDialog(false)}
            onTeamCreated={(newTeam) => {
              setTeams(prev => [newTeam, ...prev]);
              toast.success('Team created successfully');
            }}
          />
        )}
      </div>
    </PageLayout>
  );
}

export default TeamsPage;