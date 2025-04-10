import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { ArrowLeft, Plus, UserPlus, Edit, Users, Trophy, Shield, HandHelping, MessageSquare, Link as LinkIcon } from 'lucide-react';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Team } from '../types/team';
import { useAuth } from '../contexts/AuthContext';
import AddPlayerDialog from '../components/teams/AddPlayerDialog';
import { AddCoachDialog } from '../components/teams/AddCoachDialog';
import { PlayerGrid } from '../components/teams/PlayerGrid';
import { ParentList } from '../components/teams/ParentList';
import { CoachList } from '../components/teams/CoachList';
import { EditTeamDialog } from '../components/teams/EditTeamDialog';
import JoinRequestsDialog from '../components/teams/JoinRequestsDialog';
import { TeamAwardsSection } from '../components/teams/TeamAwardsSection';
import { TeamMessageDialog } from '../components/messages/TeamMessageDialog';
import { ResourcesSection } from '../components/teams/resources/ResourcesSection';
import { TeamResource } from '../types/resources';
import toast from 'react-hot-toast';
import { TeamInviteDialog } from '../components/teams/TeamInviteDialog';
import { PageLayout } from '../components/layout/PageLayout';

function TeamDetailPage() {
  const { teamId } = useParams();
  const [team, setTeam] = useState<Team | null>(null);
  const [resources, setResources] = useState<TeamResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddPlayerDialog, setShowAddPlayerDialog] = useState(false);
  const [showAddCoachDialog, setShowAddCoachDialog] = useState(false);
  const [showEditTeamDialog, setShowEditTeamDialog] = useState(false);
  const [showJoinRequestsDialog, setShowJoinRequestsDialog] = useState(false);
  const [showTeamMessageDialog, setShowTeamMessageDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadTeamData = async () => {
      if (!teamId) return;

      try {
        setIsLoading(true);
        
        // Load team data
        const teamDoc = await getDoc(doc(db, 'teams', teamId));
        if (!teamDoc.exists()) {
          toast.error('Team not found');
          return;
        }

        const teamData = teamDoc.data();
        const location = teamData.location || {
          city: teamData.city || '',
          state: '',
          country: 'USA',
          placeId: ''
        };
        
        // Process joinRequests to ensure date formats are correct
        const processedJoinRequests = (teamData.joinRequests || []).map((request: any) => ({
          ...request,
          // Convert Firestore timestamps to Date objects if needed
          createdAt: request.createdAt?.toDate?.() || request.createdAt,
          updatedAt: request.updatedAt?.toDate?.() || request.updatedAt
        }));
        
        setTeam({
          ...teamData,
          id: teamDoc.id,
          location,
          createdAt: teamData.createdAt?.toDate?.() || teamData.createdAt,
          updatedAt: teamData.updatedAt?.toDate?.() || teamData.updatedAt,
          players: teamData.players || [],
          coaches: teamData.coaches || [],
          parents: teamData.parents || [],
          joinRequests: processedJoinRequests
        } as Team);

        // Load team resources
        const resourcesRef = collection(db, 'team_resources');
        const q = query(
          resourcesRef,
          where('teamId', '==', teamId),
          orderBy('createdAt', 'desc')
        );
        
        const resourcesSnapshot = await getDocs(q);
        const loadedResources: TeamResource[] = [];
        
        resourcesSnapshot.forEach((doc) => {
          const data = doc.data();
          loadedResources.push({
            ...data,
            id: doc.id,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          } as TeamResource);
        });

        setResources(loadedResources);
      } catch (error) {
        console.error('Error loading team data:', error);
        toast.error('Unable to load team details');
      } finally {
        setIsLoading(false);
      }
    };

    loadTeamData();
  }, [teamId]);

  const isTeamCoach = currentUser && team && (
    currentUser.role === 'admin' ||
    currentUser.id === team.coachId ||
    team.coaches?.includes(currentUser.id)
  );

  if (isLoading) {
    return (
      <PageLayout className="bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!team) {
    return (
      <PageLayout className="bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Team not found</p>
        </div>
      </PageLayout>
    );
  }

  const pendingRequestsCount = team.joinRequests?.filter(
    request => request.status === 'pending'
  ).length || 0;

  const locationDisplay = team.location ? 
    `${team.location.city}, ${team.location.state}` : 
    'Location not set';

  return (
    <PageLayout className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <RouterLink
            to="/teams"
            className="flex items-center gap-2 text-brand-primary hover:opacity-90"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Teams
          </RouterLink>
        </div>

        <div className="space-y-8">
          {/* Team Header Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              {/* Team Logo */}
              <div className="flex-shrink-0">
                {team.logoUrl ? (
                  <img
                    src={team.logoUrl}
                    alt={`${team.name} logo`}
                    className="w-32 h-32 rounded-full object-cover shadow-md"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center shadow-md">
                    <Shield className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Team Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{team.name}</h1>
                <div className="text-gray-600 mb-4">
                  <p>{locationDisplay}</p>
                  <p>{team.ageDivision} • {team.type}</p>
                </div>

                {/* Action Buttons */}
                {isTeamCoach && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                    <button
                      onClick={() => setShowJoinRequestsDialog(true)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg
                        hover:bg-gray-700 transition-colors relative"
                    >
                      <Users className="w-4 h-4" />
                      Join Requests
                      {pendingRequestsCount > 0 && (
                        <span className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center
                          bg-red-500 text-white text-xs rounded-full">
                          {pendingRequestsCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setShowInviteDialog(true)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg
                        hover:bg-gray-700 transition-colors"
                    >
                      <LinkIcon className="w-4 h-4" />
                      Invite Members
                    </button>
                    <button
                      onClick={() => setShowEditTeamDialog(true)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg
                        hover:bg-gray-700 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Team
                    </button>
                    <button
                      onClick={() => setShowAddCoachDialog(true)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg
                        hover:bg-gray-700 transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add Coach
                    </button>
                    <button
                      onClick={() => setShowTeamMessageDialog(true)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg
                        hover:bg-gray-700 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Team Message
                    </button>
                    <button
                      onClick={() => setShowAddPlayerDialog(true)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
                        hover:opacity-90 transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add Player
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Coaches Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Coaches</h2>
            <CoachList
              team={team}
              onTeamUpdated={setTeam}
            />
          </div>

          {/* Players Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Players</h2>
            <PlayerGrid
              players={team.players}
              team={team}
              teamId={team.id}
              onPlayersUpdated={(updatedPlayers) => {
                setTeam(prev => prev ? { ...prev, players: updatedPlayers } : null);
              }}
              onTeamUpdated={setTeam}
            />
          </div>

          {/* Parents Section */}
          {isTeamCoach && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Parents</h2>
              <ParentList team={team} onTeamUpdated={setTeam} />
            </div>
          )}

          {/* Volunteer Management Section */}
          {isTeamCoach && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Volunteer Management</h2>
                <div className="flex gap-2">
                  <RouterLink
                    to={`/teams/${team.id}/volunteers`}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg
                      hover:bg-gray-700 transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    View Volunteers
                  </RouterLink>
                  <RouterLink
                    to={`/teams/${team.id}/volunteers/roles`}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
                      hover:opacity-90 transition-colors"
                  >
                    <HandHelping className="w-4 h-4" />
                    Manage Roles
                  </RouterLink>
                </div>
              </div>
            </div>
          )}

          {/* Resources Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <ResourcesSection
              teamId={team.id}
              resources={resources}
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
          </div>

          {/* Awards Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-6 h-6 text-brand-primary" />
              <h2 className="text-2xl font-bold text-gray-800">Team Awards</h2>
            </div>
            <TeamAwardsSection teamId={team.id} players={team.players} />
          </div>

          {/* Dialogs */}
          {isTeamCoach && (
            <>
              <AddCoachDialog
                isOpen={showAddCoachDialog}
                onClose={() => setShowAddCoachDialog(false)}
                teamId={team.id}
                onCoachAdded={() => {
                  const loadTeam = async () => {
                    const teamDoc = await getDoc(doc(db, 'teams', team.id));
                    if (teamDoc.exists()) {
                      const data = teamDoc.data();
                      setTeam(prev => prev ? { ...prev, coaches: data.coaches || [] } : null);
                    }
                  };
                  loadTeam();
                }}
              />
              <AddPlayerDialog
                isOpen={showAddPlayerDialog}
                onClose={() => setShowAddPlayerDialog(false)}
                team={team}
                onTeamUpdated={setTeam}
              />
              <EditTeamDialog
                isOpen={showEditTeamDialog}
                onClose={() => setShowEditTeamDialog(false)}
                team={team}
                onTeamUpdated={setTeam}
              />
              <JoinRequestsDialog
                isOpen={showJoinRequestsDialog}
                onClose={() => setShowJoinRequestsDialog(false)}
                team={team}
                onTeamUpdated={setTeam}
              />
              <TeamMessageDialog
                isOpen={showTeamMessageDialog}
                onClose={() => setShowTeamMessageDialog(false)}
                teamId={team.id}
                teamName={team.name}
              />
              <TeamInviteDialog
                isOpen={showInviteDialog}
                onClose={() => setShowInviteDialog(false)}
                teamId={team.id}
                teamName={team.name}
                inviteHash={team.inviteHash}
              />
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default TeamDetailPage;