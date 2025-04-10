import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Team } from '../types/team';
import { JoinTeamDialog } from '../components/teams/JoinTeamDialog';
import toast from 'react-hot-toast';
import { PageLayout } from '../components/layout/PageLayout';

function TeamSearchPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const handleJoinRequest = async (message: string) => {
    if (!currentUser || !selectedTeam) {
      toast.error('Please sign in to join teams');
      navigate('/login');
      return;
    }

    try {
      // Check if user already has a pending request
      const hasPendingRequest = selectedTeam.joinRequests?.some(
        request => request.userId === currentUser.id && request.status === 'pending'
      );

      if (hasPendingRequest) {
        toast.error('You already have a pending request for this team');
        return;
      }

      // Create join request
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

      // Update team document
      const teamRef = doc(db, 'teams', selectedTeam.id);
      await updateDoc(teamRef, {
        joinRequests: arrayUnion(joinRequest),
        updatedAt: Timestamp.now()
      });

      toast.success('Join request sent successfully');
      setSelectedTeam(null);
    } catch (error) {
      console.error('Error submitting join request:', error);
      toast.error('Failed to send join request. Please try again.');
    }
  };

  return (
    <PageLayout className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Rest of your team search UI */}
        
        {selectedTeam && (
          <JoinTeamDialog
            isOpen={!!selectedTeam}
            onClose={() => setSelectedTeam(null)}
            team={selectedTeam}
            onSubmit={handleJoinRequest}
          />
        )}
      </div>
    </PageLayout>
  );
}

export default TeamSearchPage;