import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Conversation, TeamChat } from '../../types/messages';
import { UserCircle, Users, Shield, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  conversations: (Conversation & {
    participantDetails: {
      id: string;
      displayName: string;
    }[];
  } | TeamChat)[];
  activeId?: string;
  onClose?: () => void;
}

export const ConversationList: React.FC<Props> = ({ conversations, activeId, onClose }) => {
  const { currentUser } = useAuth();
  
  const isTeamChat = (chat: any): chat is TeamChat => {
    return 'teamId' in chat;
  };

  const getGroupIcon = (groupType?: string) => {
    switch (groupType) {
      case 'coaches':
        return <Shield className="w-6 h-6 text-gray-500" />;
      case 'players':
        return <User className="w-6 h-6 text-gray-500" />;
      case 'parents':
        return <UserCircle className="w-6 h-6 text-gray-500" />;
      default:
        return <Users className="w-6 h-6 text-gray-500" />;
    }
  };

  const getGroupLabel = (groupType?: string) => {
    switch (groupType) {
      case 'coaches':
        return 'Coaches';
      case 'players':
        return 'Players';
      case 'parents':
        return 'Parents';
      default:
        return 'All Members';
    }
  };

  const getDisplayName = (conversation: Conversation & {
    participantDetails: { id: string; displayName: string; }[];
  }) => {
    const otherParticipant = conversation.participantDetails.find(
      p => p.id !== currentUser?.id
    );
    return otherParticipant?.displayName || 'Unknown User';
  };

  return (
    <div className="border-r w-full md:w-80 bg-white overflow-y-auto flex-shrink-0">
      {conversations.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No conversations yet
        </div>
      ) : (
        conversations.map((conversation) => (
          <Link
            key={conversation.id}
            to={isTeamChat(conversation) 
              ? `/messages/team/${conversation.teamId}`
              : `/messages/${conversation.id}`}
            onClick={onClose}
            className={`block p-4 border-b hover:bg-gray-50 transition-colors relative ${
              conversation.id === activeId ? 'bg-gray-50' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                {isTeamChat(conversation) 
                  ? getGroupIcon(conversation.groupType)
                  : <UserCircle className="w-6 h-6 text-gray-500" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-medium text-gray-900 truncate">
                    {isTeamChat(conversation) 
                      ? `${conversation.teamName} - ${getGroupLabel(conversation.groupType)}`
                      : getDisplayName(conversation)
                    }
                  </h3>
                  {conversation.lastMessage && (
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatDistanceToNow(conversation.lastMessage.createdAt, { addSuffix: true })}
                    </span>
                  )}
                </div>
                {conversation.lastMessage && (
                  <div className="flex items-center gap-1 mt-1">
                    {conversation.unreadCount > 0 && (
                      <span className="w-2 h-2 bg-brand-accent rounded-full flex-shrink-0" />
                    )}
                    <p className={`text-sm truncate ${
                      conversation.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'
                    }`}>
                      {isTeamChat(conversation) && (
                        <span className="font-medium">{conversation.lastMessage.senderName}: </span>
                      )}
                      {conversation.lastMessage.content}
                    </p>
                  </div>
                )}
                {conversation.unreadCount > 0 && (
                  <span className="absolute top-4 right-4 min-w-[20px] h-5 flex items-center justify-center 
                    bg-brand-accent text-white text-xs font-bold rounded-full px-1.5">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
};