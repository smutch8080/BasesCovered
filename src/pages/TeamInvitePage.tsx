import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Team } from '../types/team';
import { Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { PageLayout } from '../components/layout/PageLayout';

// Storage key for invite details
const INVITE_STORAGE_KEY = 'pendingTeamInvite';

// Helper functions for invite storage
const saveInviteToStorage = (teamId: string, inviteHash: string) => {
  try {
    localStorage.setItem(INVITE_STORAGE_KEY, JSON.stringify({ 
      teamId, 
      inviteHash,
      timestamp: Date.now() 
    }));
  } catch (error) {
    console.error('Error saving invite to storage:', error);
  }
};

const clearInviteFromStorage = () => {
  try {
    localStorage.removeItem(INVITE_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing invite from storage:', error);
  }
};

function TeamInvitePage() {
  const { teamId, inviteHash } = useParams<{ teamId: string; inviteHash: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const validateInvite = async () => {
      if (!teamId || !inviteHash) {
        console.error('Missing teamId or inviteHash');
        setError('Invalid invite link');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Use Cloud Function to validate invite - this works without authentication
        const functions = getFunctions();
        const validateTeamInvite = httpsCallable(functions, 'validateTeamInvite');
        
        const result = await validateTeamInvite({
          teamId,
          inviteHash
        });
        
        const validationData = result.data as {
          success: boolean;
          team: Team;
        };
        
        if (!validationData.success) {
          setError('Invalid or expired invite link');
          return;
        }
        
        setTeam(validationData.team);

        // Handle logged-in user
        if (currentUser) {
          // Check if already a member
          if (currentUser.teams?.includes(teamId)) {
            clearInviteFromStorage();
            navigate(`/teams/${teamId}`);
            toast.success('You are already a member of this team');
            return;
          }

          // For logged-in users, we need to check if they have pending requests
          // This requires checking the actual team data
          const teamRef = doc(db, 'teams', teamId);
          const teamDoc = await getDoc(teamRef);
          
          if (teamDoc.exists()) {
            const teamData = teamDoc.data();
            
            // Check for pending request
            const hasPendingRequest = teamData.joinRequests?.some(
              (request: any) => request.userId === currentUser.id && request.status === 'pending'
            );

            if (hasPendingRequest) {
              clearInviteFromStorage();
              navigate('/teams');
              toast('You already have a pending request to join this team', {
                duration: 4000,
                icon: '⏳',
                style: {
                  background: '#FEF3C7',
                  color: '#92400E',
                  border: '1px solid #FDE68A'
                }
              });
              return;
            }
          }

          // Redirect to join request form
          navigate(`/teams/${teamId}/join`, { 
            state: { 
              fromInvite: true,
              inviteHash 
            }
          });
        } else {
          // Save invite details for after login/registration
          saveInviteToStorage(teamId, inviteHash);
        }
      } catch (error: any) {
        console.error('Error validating invite:', error);
        
        if (error.code === 'functions/not-found') {
          setError('Team not found');
        } else if (error.code === 'functions/invalid-argument') {
          setError('Invalid or expired invite link');
        } else {
          setError('Unable to validate invite link. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    validateInvite();
  }, [teamId, inviteHash, currentUser, navigate]);

  if (isLoading) {
    return (
      <PageLayout className="bg-gray-50">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout className="bg-gray-50">
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Invalid Invite</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-brand-primary text-white rounded-lg hover:opacity-90"
            >
              Return Home
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!team) return null;

  return (
    <PageLayout className="bg-gray-50">
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          {team.logoUrl ? (
            <div className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden">
              <img
                src={team.logoUrl}
                alt={team.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Shield className="w-12 h-12 text-gray-400" />
            </div>
          )}

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Join {team.name}
          </h1>
          <p className="text-gray-600 mb-8">
            You've been invited to join {team.name}. Sign in or create an account to accept this invitation.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => navigate('/login', { 
                state: { returnUrl: window.location.pathname }
              })}
              className="w-full px-6 py-3 bg-brand-primary text-white rounded-lg hover:opacity-90"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register', {
                state: { returnUrl: window.location.pathname }
              })}
              className="w-full px-6 py-3 bg-white text-brand-primary border-2 border-brand-primary 
                rounded-lg hover:bg-brand-primary/5"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default TeamInvitePage;