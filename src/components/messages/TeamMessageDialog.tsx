import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { TeamMessageGroup, TeamMessageData } from '../../types/messages';
import { TeamMessageInput } from './TeamMessageInput';
import { Users, UserCircle, Shield, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  teamId?: string;
  teamName?: string;
}

export const TeamMessageDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  teamId: defaultTeamId,
  teamName: defaultTeamName
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState(defaultTeamId || '');
  const [selectedTeamName, setSelectedTeamName] = useState(defaultTeamName || '');
  const [selectedGroup, setSelectedGroup] = useState<TeamMessageGroup>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadTeams = async () => {
      if (!currentUser) return;

      try {
        const loadedTeams: { id: string; name: string }[] = [];

        // Get all teams where user is coach or admin
        const teamsRef = collection(db, 'teams');
        const coachQuery = query(
          teamsRef,
          where('coachId', '==', currentUser.id)
        );
        const assistantQuery = query(
          teamsRef,
          where('coaches', 'array-contains', currentUser.id)
        );

        const [coachSnapshot, assistantSnapshot] = await Promise.all([
          getDocs(coachQuery),
          getDocs(assistantQuery)
        ]);

        // Add teams where user is head coach
        coachSnapshot.forEach(doc => {
          loadedTeams.push({
            id: doc.id,
            name: doc.data().name
          });
        });

        // Add teams where user is assistant coach (avoiding duplicates)
        assistantSnapshot.forEach(doc => {
          if (!loadedTeams.some(team => team.id === doc.id)) {
            loadedTeams.push({
              id: doc.id,
              name: doc.data().name
            });
          }
        });

        setTeams(loadedTeams);
        
        // If no team is selected and we have teams, select the first one
        if (!selectedTeamId && loadedTeams.length > 0) {
          setSelectedTeamId(loadedTeams[0].id);
          setSelectedTeamName(loadedTeams[0].name);
        }
      } catch (error) {
        console.error('Error loading teams:', error);
        toast.error('Unable to load teams');
      }
    };

    if (isOpen) {
      loadTeams();
    }
  }, [currentUser, isOpen, selectedTeamId]);

  const handleSendMessage = async (content: string) => {
    if (!currentUser || !content.trim() || !selectedTeamId) {
      toast.error('Please select a team and enter a message');
      return;
    }

    try {
      setIsLoading(true);

      // Create or get team chat
      const chatsRef = collection(db, 'team_chats');
      const q = query(
        chatsRef,
        where('teamId', '==', selectedTeamId),
        where('groupType', '==', selectedGroup)
      );
      
      const chatSnapshot = await getDocs(q);
      let chatId: string;

      if (chatSnapshot.empty) {
        // Create new team chat
        const chatDoc = await addDoc(chatsRef, {
          teamId: selectedTeamId,
          teamName: selectedTeamName,
          groupType: selectedGroup,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        chatId = chatDoc.id;
      } else {
        chatId = chatSnapshot.docs[0].id;
      }

      // Add message
      const messageData = {
        chatId,
        content: content.trim(),
        senderId: currentUser.id,
        senderName: currentUser.displayName,
        teamId: selectedTeamId,
        groupType: selectedGroup,
        createdAt: Timestamp.now(),
        readBy: [currentUser.id]
      };

      await addDoc(collection(db, 'messages'), messageData);

      onClose();
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending team message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xl">
          <Dialog.Title className="text-xl font-bold mb-6">
            Send Team Message
          </Dialog.Title>

          <div className="space-y-6">
            {/* Team Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team:
              </label>
              <select
                value={selectedTeamId}
                onChange={(e) => {
                  const team = teams.find(t => t.id === e.target.value);
                  if (team) {
                    setSelectedTeamId(team.id);
                    setSelectedTeamName(team.name);
                  }
                }}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              >
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Group Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send to:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedGroup('all')}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                    selectedGroup === 'all'
                      ? 'border-brand-primary bg-brand-primary/5'
                      : 'border-gray-200 hover:border-brand-primary/50'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span>Everyone</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGroup('coaches')}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                    selectedGroup === 'coaches'
                      ? 'border-brand-primary bg-brand-primary/5'
                      : 'border-gray-200 hover:border-brand-primary/50'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span>Coaches Only</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGroup('players')}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                    selectedGroup === 'players'
                      ? 'border-brand-primary bg-brand-primary/5'
                      : 'border-gray-200 hover:border-brand-primary/50'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>Players Only</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGroup('parents')}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                    selectedGroup === 'parents'
                      ? 'border-brand-primary bg-brand-primary/5'
                      : 'border-gray-200 hover:border-brand-primary/50'
                  }`}
                >
                  <UserCircle className="w-5 h-5" />
                  <span>Parents Only</span>
                </button>
              </div>
            </div>

            {/* Message Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message:
              </label>
              <TeamMessageInput
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                placeholder={`Message ${selectedTeamName} ${selectedGroup === 'all' ? 'team' : selectedGroup}...`}
              />
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};