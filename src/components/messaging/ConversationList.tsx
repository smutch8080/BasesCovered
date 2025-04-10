import React from 'react';
import { Conversation } from '../../services/messaging/types';
import { formatDistanceToNow } from 'date-fns';
import { Search, UserCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ConversationListProps {
  conversations: Conversation[];
  loading: boolean;
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  loading,
  selectedConversationId,
  onSelectConversation
}) => {
  const { currentUser } = useAuth();
  // Filter conversations (could be expanded with search functionality)
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const filteredConversations = React.useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    
    const query = searchQuery.toLowerCase();
    return conversations.filter(conversation => {
      // Search in participant names
      const participantMatch = conversation.participants.some(
        p => p.displayName.toLowerCase().includes(query)
      );
      
      // Search in last message
      const lastMessageMatch = conversation.lastMessage?.content.toLowerCase().includes(query);
      
      // Search in team name for team conversations
      const teamNameMatch = conversation.teamName?.toLowerCase().includes(query);
      
      return participantMatch || lastMessageMatch || teamNameMatch;
    });
  }, [conversations, searchQuery]);
  
  // Sort conversations by most recent message
  const sortedConversations = React.useMemo(() => {
    return [...filteredConversations].sort((a, b) => {
      const dateA = a.lastMessage?.createdAt || a.updatedAt;
      const dateB = b.lastMessage?.createdAt || b.updatedAt;
      return dateB.getTime() - dateA.getTime();
    });
  }, [filteredConversations]);
  
  // Format the conversation title
  const getConversationTitle = (conversation: Conversation): string => {
    if (conversation.type === 'team') {
      return conversation.teamName || 'Team Chat';
    } else if (conversation.type === 'group') {
      return conversation.metadata?.groupName || 
        conversation.participants
          .filter(p => p.id !== currentUser?.id)
          .map(p => p.displayName)
          .join(', ');
    } else {
      // For direct messages, show the other participant's name
      const otherParticipant = conversation.participants.find(p => p.id !== currentUser?.id);
      return otherParticipant?.displayName || 'Unknown User';
    }
  };
  
  // Get the profile picture for a conversation
  const getConversationAvatar = (conversation: Conversation): React.ReactNode => {
    if (conversation.type === 'team') {
      // For team chats, we could use a team logo or a default icon
      return (
        <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center">
          <UserCircle className="w-6 h-6 text-brand-primary" />
        </div>
      );
    } else if (conversation.type === 'group') {
      // For group chats, we could use a collage of user avatars or a default icon
      return (
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <UserCircle className="w-6 h-6 text-gray-500 dark:text-gray-400" />
        </div>
      );
    } else {
      // For direct messages, show the other participant's profile picture
      const otherParticipant = conversation.participants.find(p => p.id !== currentUser?.id);
      
      // Check if the other participant has a profile picture
      if (otherParticipant?.profilePicture) {
        return (
          <img 
            src={otherParticipant.profilePicture} 
            alt={otherParticipant.displayName}
            className="w-10 h-10 rounded-full object-cover"
          />
        );
      } 
      
      // If the last message is from the other participant and has a profile picture, use that
      if (conversation.lastMessage && 
          conversation.lastMessage.senderId !== currentUser?.id && 
          conversation.lastMessage.senderProfilePicture) {
        return (
          <img 
            src={conversation.lastMessage.senderProfilePicture} 
            alt={conversation.lastMessage.senderName}
            className="w-10 h-10 rounded-full object-cover"
          />
        );
      }
      
      // Fallback to generic avatar
      return (
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <UserCircle className="w-6 h-6 text-gray-500 dark:text-gray-400" />
        </div>
      );
    }
  };
  
  // Format the last message preview
  const getLastMessagePreview = (conversation: Conversation): string => {
    if (!conversation.lastMessage) return 'No messages yet';
    
    const { content, senderId, senderName } = conversation.lastMessage;
    const isSentByCurrentUser = senderId === currentUser?.id;
    
    // Truncate message if too long
    const truncatedContent = content.length > 30 
      ? `${content.substring(0, 30)}...` 
      : content;
    
    return isSentByCurrentUser 
      ? `You: ${truncatedContent}` 
      : `${senderName}: ${truncatedContent}`;
  };
  
  // Format the timestamp
  const formatTimestamp = (date: Date): string => {
    return formatDistanceToNow(date, { addSuffix: true });
  };
  
  // Check if a conversation has unread messages
  const hasUnreadMessages = (conversation: Conversation): boolean => {
    if (!conversation.lastMessage || !currentUser) return false;
    
    // If the last message is from the current user, it's not unread
    if (conversation.lastMessage.senderId === currentUser.id) return false;
    
    // Check if the conversation has unread count
    if (conversation.unreadCount > 0) return true;
    
    // For backward compatibility, check if the message has been read by the current user
    // This assumes the Message type has a readBy property, which might not be in the lastMessage
    return conversation.unreadCount > 0;
  };
  
  if (loading) {
    return (
      <div className="p-4 h-full">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* Search bar */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
      </div>
      
      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {sortedConversations.length > 0 ? (
          <ul>
            {sortedConversations.map(conversation => {
              const isUnread = hasUnreadMessages(conversation);
              
              return (
                <li 
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer ${
                    selectedConversationId === conversation.id 
                      ? 'bg-gray-100 dark:bg-gray-700' 
                      : isUnread ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start">
                    {/* Avatar */}
                    <div className="mr-3 flex-shrink-0">
                      {getConversationAvatar(conversation)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className={`text-sm ${isUnread ? 'font-bold' : 'font-medium'} truncate`}>
                          {getConversationTitle(conversation)}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          {formatTimestamp(conversation.lastMessage?.createdAt || conversation.updatedAt)}
                        </span>
                      </div>
                      <div className="flex justify-between items-start mt-1">
                        <p className={`text-xs ${isUnread ? 'text-gray-800 dark:text-gray-200 font-medium' : 'text-gray-500 dark:text-gray-400'} truncate`}>
                          {getLastMessagePreview(conversation)}
                        </p>
                        {isUnread && (
                          <span className="ml-2 px-2 py-0.5 bg-brand-primary text-white text-xs rounded-full">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex items-center justify-center h-full p-4 text-gray-500 dark:text-gray-400">
            {searchQuery ? 'No conversations match your search' : 'No conversations yet'}
          </div>
        )}
      </div>
    </div>
  );
}; 