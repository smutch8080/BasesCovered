import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageLayout } from '../components/layout/PageLayout';

function TeamJoinPage() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [teamName, setTeamName] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    // Load team name
    const loadTeamName = async () => {
      if (!teamId) return;
      try {
        const teamDoc = await getDoc(doc(db, 'teams', teamId));
        if (teamDoc.exists()) {
          setTeamName(teamDoc.data().name);
        } else {
          toast.error('Team not found');
          navigate('/teams');
        }
      } catch (error) {
        console.error('Error loading team:', error);
        toast.error('Unable to load team details');
        navigate('/teams');
      }
    };

    loadTeamName();
  }, [teamId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !teamId || !message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      setIsLoading(true);

      // Verify team exists and check current status
      const teamRef = doc(db, 'teams', teamId);
      const teamDoc = await getDoc(teamRef);

      if (!teamDoc.exists()) {
        toast.error('Team not found');
        navigate('/teams');
        return;
      }

      const teamData = teamDoc.data();

      // Check if user is already a member
      if (currentUser.teams?.includes(teamId)) {
        toast.error('You are already a member of this team');
        navigate(`/teams/${teamId}`);
        return;
      }

      // Check for existing pending request
      const hasPendingRequest = teamData.joinRequests?.some(
        (request: any) => request.userId === currentUser.id && request.status === 'pending'
      );

      if (hasPendingRequest) {
        toast.error('You already have a pending request to join this team');
        navigate('/teams');
        return;
      }

      // Create join request with proper data structure
      const joinRequest = {
        id: Math.random().toString(),
        userId: currentUser.id,
        userName: currentUser.displayName,
        userRole: currentUser.role,
        message: message.trim(),
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      // Update team document with new join request
      await updateDoc(teamRef, {
        joinRequests: arrayUnion(joinRequest),
        updatedAt: Timestamp.now()
      });

      toast.success('Join request sent successfully');
      navigate('/teams');
    } catch (error: any) {
      console.error('Error sending join request:', error);
      
      if (error.code === 'permission-denied') {
        toast.error('You do not have permission to join this team');
      } else if (error.code === 'not-found') {
        toast.error('Team not found');
        navigate('/teams');
      } else if (error.code === 'invalid-argument') {
        toast.error('Please try again with valid information');
      } else {
        toast.error('Failed to send join request. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <PageLayout className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Please sign in to join teams</p>
      </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="bg-gray-50">
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-brand-primary" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Join Team</h1>
              {teamName && (
                <p className="text-gray-600 mt-1">{teamName}</p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message to Coach
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                placeholder="Introduce yourself and explain why you'd like to join the team..."
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/teams')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </PageLayout>
  );
}

export default TeamJoinPage;