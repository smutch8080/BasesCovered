import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { TodoAssignment } from '../../types/todo';
import { Users, User, UserCircle, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (assignment: TodoAssignment) => void;
  teamId?: string;
}

export const AssignmentDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  onAssign,
  teamId
}) => {
  const [selectedType, setSelectedType] = useState<'user' | 'group' | 'team'>('team');
  const [users, setUsers] = useState<{ id: string; name: string; role: string }[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadTeamMembers = async () => {
      if (!teamId || !currentUser) return;

      try {
        const teamDoc = await getDocs(query(
          collection(db, 'teams'),
          where('__name__', '==', teamId)
        ));

        if (!teamDoc.empty) {
          const teamData = teamDoc.docs[0].data();
          const members = [
            ...(teamData.players || []).map((p: any) => ({
              id: p.id,
              name: p.name,
              role: 'player'
            })),
            ...(teamData.coaches || []).map((c: string) => ({
              id: c,
              name: 'Coach', // You'll need to fetch coach names
              role: 'coach'
            })),
            ...(teamData.parents || []).map((p: string) => ({
              id: p,
              name: 'Parent', // You'll need to fetch parent names
              role: 'parent'
            }))
          ];

          setUsers(members);
        }
      } catch (error) {
        console.error('Error loading team members:', error);
        toast.error('Failed to load team members');
      }
    };

    if (isOpen) {
      loadTeamMembers();
    }
  }, [teamId, currentUser, isOpen]);

  const handleAssign = () => {
    let name = '';
    switch (selectedType) {
      case 'team':
        name = 'Entire Team';
        break;
      case 'group':
        name = `All ${selectedId}s`;
        break;
      case 'user':
        name = users.find(u => u.id === selectedId)?.name || 'Unknown User';
        break;
    }

    onAssign({
      type: selectedType,
      id: selectedId || teamId || '',
      name
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <Dialog.Title className="text-xl font-bold mb-6">
            Assign Todo
          </Dialog.Title>

          <div className="space-y-6">
            {/* Assignment Type Selection */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setSelectedType('team');
                  setSelectedId(teamId || '');
                }}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                  selectedType === 'team'
                    ? 'border-brand-primary bg-brand-primary/5'
                    : 'border-gray-200 hover:border-brand-primary/50'
                }`}
              >
                <Users className="w-6 h-6" />
                <span>Entire Team</span>
              </button>
              <button
                onClick={() => {
                  setSelectedType('group');
                  setSelectedId('');
                }}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                  selectedType === 'group'
                    ? 'border-brand-primary bg-brand-primary/5'
                    : 'border-gray-200 hover:border-brand-primary/50'
                }`}
              >
                <Shield className="w-6 h-6" />
                <span>Group</span>
              </button>
              <button
                onClick={() => {
                  setSelectedType('user');
                  setSelectedId('');
                }}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                  selectedType === 'user'
                    ? 'border-brand-primary bg-brand-primary/5'
                    : 'border-gray-200 hover:border-brand-primary/50'
                }`}
              >
                <User className="w-6 h-6" />
                <span>Individual</span>
              </button>
            </div>

            {/* Group Selection */}
            {selectedType === 'group' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Group
                </label>
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="">Select a group...</option>
                  <option value="player">All Players</option>
                  <option value="coach">All Coaches</option>
                  <option value="parent">All Parents</option>
                </select>
              </div>
            )}

            {/* User Selection */}
            {selectedType === 'user' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select User
                </label>
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="">Select a user...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={!selectedId && selectedType !== 'team'}
              className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Assign
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};