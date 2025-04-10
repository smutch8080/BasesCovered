import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { collection, query, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { User } from '../../types/auth';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  onConversationCreated: (conversationId: string) => void;
}

export const NewConversationDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUserId,
  onConversationCreated
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Load all users once when dialog opens
  useEffect(() => {
    const loadUsers = async () => {
      if (!isOpen) return;

      try {
        setIsLoading(true);
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);
        const loadedUsers: User[] = [];
        
        querySnapshot.forEach((doc) => {
          // Skip current user
          if (doc.id !== currentUserId) {
            loadedUsers.push({
              ...doc.data(),
              id: doc.id
            } as User);
          }
        });

        setAllUsers(loadedUsers);
        setUsers(loadedUsers);
      } catch (error) {
        console.error('Error loading users:', error);
        toast.error('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [isOpen, currentUserId]);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setUsers(allUsers);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filtered = allUsers.filter(user => 
      user.displayName.toLowerCase().includes(searchTermLower) ||
      user.email.toLowerCase().includes(searchTermLower)
    );
    setUsers(filtered);
  }, [searchTerm, allUsers]);

  const handleSelectUser = async (user: User) => {
    try {
      // Create new conversation
      const conversationsRef = collection(db, 'conversations');
      const newConversation = {
        participants: [currentUserId, user.id],
        createdAt: new Date(),
        updatedAt: new Date(),
        unreadCount: 0
      };

      const docRef = await addDoc(conversationsRef, newConversation);
      onConversationCreated(docRef.id);
      onClose();
      toast.success('Conversation created successfully');
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <Dialog.Title className="text-xl font-bold mb-4">
            New Conversation
          </Dialog.Title>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              autoFocus
            />
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <p className="text-center text-gray-600 py-4">Loading users...</p>
            ) : users.length > 0 ? (
              <div className="space-y-2">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left"
                  >
                    <div>
                      <div className="font-medium">{user.displayName}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400 capitalize">{user.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">
                No users found matching "{searchTerm}"
              </p>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};