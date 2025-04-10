import React, { useState } from 'react';
import { Conversation, Participant } from '../../services/messaging/types';
import { useConversation } from '../../hooks/useConversation';
import { useUsers, UserData } from '../../hooks/useUsers';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../ui/Avatar';
import { X, Plus, Search, UserPlus, Settings, Trash, LogOut, Check } from 'lucide-react';

interface ConversationDetailsProps {
  conversation: Conversation;
  onClose: () => void;
}

export function ConversationDetails({ conversation, onClose }: ConversationDetailsProps) {
  const { currentUser } = useAuth();
  const { updateConversation, addParticipant, removeParticipant } = useConversation(conversation.id);
  const { users, filteredUsers, searchUsers } = useUsers();
  
  const [showAddParticipants, setShowAddParticipants] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<UserData[]>([]);
  
  // Check if current user is admin or owner
  const isCurrentUserAdminOrOwner = conversation.participants.some(
    p => p.id === currentUser?.id && (p.role === 'admin' || p.role === 'owner')
  );
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchUsers(query);
  };
  
  // Toggle user selection
  const toggleUserSelection = (user: UserData) => {
    const isSelected = selectedUsers.some(u => u.id === user.id);
    
    if (isSelected) {
      setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers(prev => [...prev, user]);
    }
  };
  
  // Add selected users to conversation
  const handleAddParticipants = async () => {
    if (selectedUsers.length === 0) return;
    
    // Add each selected user
    for (const user of selectedUsers) {
      await addParticipant(user.id, user.displayName);
    }
    
    // Reset state
    setSelectedUsers([]);
    setShowAddParticipants(false);
    setSearchQuery('');
  };
  
  // Remove participant from conversation
  const handleRemoveParticipant = async (participantId: string) => {
    if (window.confirm('Are you sure you want to remove this participant?')) {
      await removeParticipant(participantId);
    }
  };
  
  // Leave conversation
  const handleLeaveConversation = async () => {
    if (window.confirm('Are you sure you want to leave this conversation?')) {
      await removeParticipant(currentUser?.id || '');
      onClose();
    }
  };
  
  // Render participant list
  const renderParticipantList = () => {
    return conversation.participants.map(participant => (
      <div 
        key={participant.id} 
        className="flex items-center justify-between p-2 hover:bg-muted rounded-lg"
      >
        <div className="flex items-center">
          <Avatar 
            src={participant.profilePicture || null} 
            name={participant.displayName} 
            size="sm"
          />
          <div className="ml-2">
            <p className="text-sm font-medium">
              {participant.displayName}
              {participant.id === currentUser?.id && ' (You)'}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {participant.role}
              {participant.isTyping && ' • Typing...'}
            </p>
          </div>
        </div>
        
        {/* Admin actions */}
        {isCurrentUserAdminOrOwner && participant.id !== currentUser?.id && (
          <button
            onClick={() => handleRemoveParticipant(participant.id)}
            className="p-1 text-muted-foreground hover:text-destructive rounded-full hover:bg-destructive/10"
            title="Remove participant"
          >
            <X size={16} />
          </button>
        )}
      </div>
    ));
  };
  
  // Render user search results
  const renderUserSearchResults = () => {
    // Filter out users who are already participants
    const availableUsers = filteredUsers.filter(
      user => !conversation.participants.some(p => p.id === user.id)
    );
    
    if (availableUsers.length === 0) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          {searchQuery ? 'No users found' : 'Start typing to search for users'}
        </div>
      );
    }
    
    return availableUsers.map(user => {
      const isSelected = selectedUsers.some(u => u.id === user.id);
      
      return (
        <div 
          key={user.id} 
          className={`
            flex items-center justify-between p-2 rounded-lg cursor-pointer
            ${isSelected ? 'bg-primary/10' : 'hover:bg-muted'}
          `}
          onClick={() => toggleUserSelection(user)}
        >
          <div className="flex items-center">
            <Avatar 
              src={user.profilePicture || null} 
              name={user.displayName} 
              size="sm"
            />
            <div className="ml-2">
              <p className="text-sm font-medium">{user.displayName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          
          <div className={`w-5 h-5 rounded-full border ${
            isSelected 
              ? 'bg-primary border-primary' 
              : 'border-muted-foreground'
          } flex items-center justify-center`}>
            {isSelected && <Check size={12} className="text-primary-foreground" />}
          </div>
        </div>
      );
    });
  };
  
  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-semibold">Conversation Details</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
          title="Close details"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* Conversation info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center mb-4">
          <Avatar 
            src={null} 
            name={conversation.type === 'direct'
              ? conversation.participants.find(p => p.id !== currentUser?.id)?.displayName || 'Conversation'
              : conversation.metadata?.groupName || 'Group'
            }
            size="lg"
          />
          <div className="ml-3">
            <h3 className="text-lg font-medium">
              {conversation.type === 'direct'
                ? conversation.participants.find(p => p.id !== currentUser?.id)?.displayName || 'Conversation'
                : conversation.metadata?.groupName || 'Group'
              }
            </h3>
            <p className="text-sm text-muted-foreground">
              {conversation.type === 'direct' ? 'Direct Message' : 'Group'}
              {' • '}
              {conversation.participants.length} participants
            </p>
          </div>
        </div>
        
        {/* Conversation actions */}
        <div className="flex flex-wrap gap-2">
          {isCurrentUserAdminOrOwner && (
            <button
              onClick={() => setShowAddParticipants(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm"
            >
              <UserPlus size={16} />
              <span>Add People</span>
            </button>
          )}
          
          <button
            onClick={handleLeaveConversation}
            className="flex items-center gap-1 px-3 py-1.5 bg-destructive/10 text-destructive rounded-lg text-sm"
          >
            <LogOut size={16} />
            <span>Leave</span>
          </button>
        </div>
      </div>
      
      {/* Participants section */}
      <div className="flex-1 overflow-y-auto">
        {showAddParticipants ? (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium">Add Participants</h3>
              <button
                onClick={() => {
                  setShowAddParticipants(false);
                  setSelectedUsers([]);
                  setSearchQuery('');
                }}
                className="p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
              >
                <X size={16} />
              </button>
            </div>
            
            {/* Search input */}
            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            {/* User search results */}
            <div className="mb-4 max-h-[300px] overflow-y-auto">
              {renderUserSearchResults()}
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAddParticipants(false);
                  setSelectedUsers([]);
                }}
                className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddParticipants}
                disabled={selectedUsers.length === 0}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  selectedUsers.length > 0
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                Add ({selectedUsers.length})
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium">Participants</h3>
              {isCurrentUserAdminOrOwner && (
                <button
                  onClick={() => setShowAddParticipants(true)}
                  className="p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
                  title="Add participants"
                >
                  <Plus size={16} />
                </button>
              )}
            </div>
            
            <div className="space-y-1">
              {renderParticipantList()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 