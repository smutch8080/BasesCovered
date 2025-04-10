import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useCreateConversation } from '../../hooks/useCreateConversation';
import { useUsers, UserData } from '../../hooks/useUsers';
import { useFirebaseStatus } from '../../hooks/useFirebaseStatus';
import { Search, X, Users, MessageCircle, UserPlus, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ConversationCreateData } from '../../services/messaging/types';

interface NewConversationModalProps {
  onClose: () => void;
  onConversationCreated: (conversationId: string) => void;
}

export const NewConversationModal: React.FC<NewConversationModalProps> = ({
  onClose,
  onConversationCreated
}) => {
  // Get users from Firebase
  const { filteredUsers, loading: loadingUsers, error: usersError, searchUsers, searchQuery } = useUsers();
  const { currentUser } = useAuth();
  const { createConversation, isCreating: isCreatingConversation, error: createError } = useCreateConversation();
  const { isConnected, isChecking, error: connectionError, checkConnection } = useFirebaseStatus();
  
  // Local state
  const [selectedUsers, setSelectedUsers] = useState<UserData[]>([]);
  const [initialMessage, setInitialMessage] = useState('');
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');
  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInputValue(value);
    searchUsers(value);
  };
  
  // Toggle user selection
  const toggleUserSelection = (user: UserData) => {
    if (selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
      
      // If more than one user is selected, automatically enable group chat
      if (selectedUsers.length > 0) {
        setIsGroupChat(true);
      }
    }
  };
  
  // Create conversation
  const handleCreateConversation = async () => {
    if (selectedUsers.length === 0) {
      setStatusMessage({ type: 'error', message: 'Please select at least one user to start a conversation with.' });
      return;
    }

    if (isGroupChat && !groupName.trim()) {
      setStatusMessage({ type: 'error', message: 'Please enter a group name.' });
      return;
    }

    setIsCreating(true);
    setStatusMessage({ type: 'info', message: 'Creating conversation...' });

    try {
      // Manually check connection first
      await checkConnection();
      console.log('Connection status after check:', isConnected);
      
      // If still not connected, show error
      if (isConnected === false) {
        setStatusMessage({ 
          type: 'error', 
          message: 'Cannot create conversation while offline. Please check your connection and try again.' 
        });
        setIsCreating(false);
        return;
      }
      
      // Validate participant IDs
      const validParticipantIds = selectedUsers
        .map(user => user.id)
        .filter(id => typeof id === 'string' && id.trim() !== '');
      
      if (validParticipantIds.length === 0) {
        setStatusMessage({ 
          type: 'error', 
          message: 'No valid participants selected. Please select at least one user.' 
        });
        setIsCreating(false);
        return;
      }
      
      console.log('Creating conversation with participants:', selectedUsers.map(user => ({ id: user.id, name: user.displayName })));
      
      // Create conversation data
      const conversationData: ConversationCreateData = {
        type: isGroupChat ? 'group' : 'direct',
        participantIds: validParticipantIds,
        initialMessage: initialMessage.trim() || undefined,
        metadata: {}
      };
      
      // Add group name to metadata if it's a group chat
      if (isGroupChat && groupName.trim()) {
        conversationData.metadata = { groupName: groupName.trim() };
      }
      
      console.log('Conversation data before creation:', JSON.stringify(conversationData, null, 2));
      
      const conversation = await createConversation(conversationData);
      
      console.log('Conversation created successfully:', conversation);
      setStatusMessage({ type: 'success', message: 'Conversation created successfully!' });
      
      // Close modal and notify parent
      setTimeout(() => {
        if (conversation) {
          onConversationCreated(conversation.id);
        }
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error creating conversation:', error);
      
      // Provide more specific error messages based on the error type
      let errorMessage = 'Failed to create conversation';
      
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        
        if (error.message.includes('invalid data') || error.message.includes('undefined')) {
          errorMessage = 'Invalid data format. Please try again with different settings.';
        } else if (error.message.includes('permission') || error.message.includes('unauthorized')) {
          errorMessage = 'You do not have permission to create this conversation.';
        } else if (error.message.includes('connection') || error.message.includes('network') || error.message.includes('offline')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('authenticated') || error.message.includes('auth')) {
          errorMessage = 'Authentication error. Please sign in again.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      setStatusMessage({ 
        type: 'error', 
        message: `${errorMessage} (Attempt ${retryCount + 1}). You can try again.` 
      });
      setIsCreating(false);
    }
  };

  // Retry connection and conversation creation
  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    
    // First check connection
    setStatusMessage({
      type: 'info',
      message: 'Checking connection...'
    });
    
    try {
      await checkConnection();
      
      if (isConnected) {
        // If connected, try creating the conversation again
        handleCreateConversation();
      } else {
        setStatusMessage({
          type: 'error',
          message: 'Still unable to connect. Please check your internet connection and try again.'
        });
      }
    } catch (error) {
      console.error('Error checking connection during retry:', error);
      setStatusMessage({
        type: 'error',
        message: 'Error checking connection. Please try again later.'
      });
    }
  };
  
  // Close modal when clicking outside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };
  
  // Get user avatar or placeholder
  const getUserAvatar = (user: UserData) => {
    if (user.profilePicture) {
      return (
        <img 
          src={user.profilePicture} 
          alt={user.displayName}
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    }
    
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
          {user.displayName.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };
  
  // Display error message if there's an error
  const error = usersError || createError || connectionError;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold">New Conversation</h2>
          <div className="flex items-center gap-3">
            {/* Connection status indicator */}
            <div className="flex items-center">
              {isChecking ? (
                <div className="text-yellow-500 dark:text-yellow-400 flex items-center gap-1" title="Checking connection...">
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  <span className="text-sm">Checking...</span>
                </div>
              ) : isConnected === null ? (
                <div className="text-gray-400 dark:text-gray-500 flex items-center gap-1" title="Connection status unknown">
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  <span className="text-sm">Checking...</span>
                </div>
              ) : isConnected ? (
                <div className="text-green-500 dark:text-green-400 flex items-center gap-1" title="Connected to Firebase">
                  <Wifi className="w-4 h-4" />
                  <span className="text-sm">Connected</span>
                </div>
              ) : (
                <button 
                  onClick={checkConnection}
                  className="text-red-500 dark:text-red-400 flex items-center gap-1 hover:text-red-600 dark:hover:text-red-300"
                  title="Connection error - Click to retry"
                  disabled={isChecking}
                >
                  {isChecking ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <WifiOff className="w-4 h-4" />
                      <span className="text-sm">Offline - Click to retry</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Type toggle */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-4">
              <button
                onClick={() => setIsGroupChat(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  !isGroupChat 
                    ? 'bg-brand-primary text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>Direct Message</span>
              </button>
              <button
                onClick={() => setIsGroupChat(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  isGroupChat 
                    ? 'bg-brand-primary text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Group Chat</span>
              </button>
            </div>
            
            {/* Group name input (only for group chats) */}
            {isGroupChat && (
              <div className="mt-4">
                <label htmlFor="group-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Group Name (optional)
                </label>
                <input
                  type="text"
                  id="group-name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            )}
          </div>
          
          {/* Selected users */}
          {selectedUsers.length > 0 && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selected ({selectedUsers.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <div 
                    key={user.id}
                    className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full pl-2 pr-1 py-1"
                  >
                    {getUserAvatar(user)}
                    <span className="text-sm">{user.displayName}</span>
                    <button
                      onClick={() => toggleUserSelection(user)}
                      className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Search and user list */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search users..."
                value={searchInputValue}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                disabled={loadingUsers}
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
            
            <div className="overflow-y-auto max-h-[30vh]">
              {loadingUsers ? (
                <div className="py-4 text-center text-gray-500 dark:text-gray-400 flex justify-center">
                  <div className="animate-spin h-6 w-6 border-2 border-brand-primary border-t-transparent rounded-full"></div>
                  <span className="ml-2">Loading users...</span>
                </div>
              ) : filteredUsers.length > 0 ? (
                <ul className="space-y-2">
                  {filteredUsers.map(user => (
                    <li 
                      key={user.id}
                      onClick={() => toggleUserSelection(user)}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${
                        selectedUsers.some(u => u.id === user.id)
                          ? 'bg-brand-primary bg-opacity-10 dark:bg-opacity-20'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {getUserAvatar(user)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
                          {user.displayName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.role || user.email}
                          {user.teamNames && user.teamNames.length > 0 && ` • ${user.teamNames.join(', ')}`}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {selectedUsers.some(u => u.id === user.id) ? (
                          <div className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-4 text-center text-gray-500 dark:text-gray-400">
                  {searchInputValue ? 'No users found' : 'Start typing to search users'}
                </div>
              )}
            </div>
          </div>
          
          {/* Initial message */}
          <div className="p-4">
            <label htmlFor="initial-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Initial Message (optional)
            </label>
            <textarea
              id="initial-message"
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              placeholder="Type your first message..."
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
              rows={3}
            />
          </div>
        </div>
        
        {/* Footer with status and actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {statusMessage && (
            <div className={`mb-4 p-3 rounded-lg ${
              statusMessage.type === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
              statusMessage.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
              'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
            }`}>
              <p>{statusMessage.message}</p>
              
              {statusMessage.type === 'error' && (
                <button 
                  onClick={handleRetry}
                  className="mt-2 flex items-center gap-1 text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  disabled={isCreating || isChecking}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry</span>
                </button>
              )}
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              onClick={handleCreateConversation}
              className={`px-4 py-2 rounded-lg text-white ${
                isCreating || !isConnected
                  ? 'bg-blue-400 dark:bg-blue-600 cursor-not-allowed'
                  : 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600'
              }`}
              disabled={isCreating || !isConnected || selectedUsers.length === 0}
            >
              {isCreating ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Conversation'
              )}
            </button>
          </div>
        </div>
        
        {/* Error message from context */}
        {error && !statusMessage && (
          <div className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-sm">
            <div className="flex justify-between items-center">
              <div>{error.message}</div>
              <button 
                onClick={handleRetry}
                className="text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 text-sm font-medium"
                disabled={isCreatingConversation || isChecking}
              >
                {isCreatingConversation || isChecking ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="flex items-center gap-1">
                    <RefreshCw className="w-4 h-4" />
                    Retry
                  </span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 