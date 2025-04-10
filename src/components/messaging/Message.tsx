import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageReactions, Reaction as MessageReactionType } from './MessageReactions';
import { ReadReceipts } from './ReadReceipts';
import { MessageActions } from './MessageActions';
import { MessageEditForm } from './MessageEditForm';
import { Participant, Message as MessageType, Reaction } from '../../services/messaging/types';
import { FileAttachment } from './FileAttachment';

interface MessageProps {
  message: MessageType;
  isCurrentUserMessage: boolean;
  currentUserId: string;
  participants: Participant[];
  showSender: boolean;
  isEditing: boolean;
  onEdit: (messageId: string, content: string) => void;
  onDelete: (messageId: string) => void;
  onReply: (messageId: string) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
  onCancelEdit: () => void;
}

export const Message: React.FC<MessageProps> = ({
  message,
  isCurrentUserMessage,
  currentUserId,
  participants,
  showSender,
  isEditing,
  onEdit,
  onDelete,
  onReply,
  onAddReaction,
  onRemoveReaction,
  onCancelEdit,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Format the message timestamp
  const formattedTime = message.timestamp 
    ? formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })
    : '';
  
  // Find the sender from participants
  const sender = participants.find(p => p.id === message.senderId);
  
  // Handle adding a reaction
  const handleAddReaction = (emoji: string) => {
    onAddReaction(message.id, emoji);
  };
  
  // Handle removing a reaction
  const handleRemoveReaction = (emoji: string) => {
    onRemoveReaction(message.id, emoji);
  };
  
  // Handle saving an edited message
  const handleSaveEdit = (content: string) => {
    onEdit(message.id, content);
  };

  // Convert message reactions to the format expected by MessageReactions component
  const convertReactions = (reactions: Reaction[] = []): MessageReactionType[] => {
    // Group reactions by emoji
    const groupedReactions = reactions.reduce<Record<string, string[]>>((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = [];
      }
      acc[reaction.emoji].push(reaction.userId);
      return acc;
    }, {});
    
    // Convert to MessageReactionType array
    return Object.entries(groupedReactions).map(([emoji, userIds]) => ({
      emoji,
      count: userIds.length,
      userIds
    }));
  };

  return (
    <div 
      className={`group flex mb-4 ${isCurrentUserMessage ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`max-w-[75%] ${isCurrentUserMessage ? 'order-2' : 'order-1'}`}>
        {/* Sender info */}
        {showSender && !isCurrentUserMessage && (
          <div className="flex items-center mb-1">
            {sender?.profilePictureUrl ? (
              <img 
                src={sender.profilePictureUrl} 
                alt={sender?.displayName || 'User'} 
                className="w-6 h-6 rounded-full mr-2"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-2">
                {(sender?.displayName || 'U').charAt(0)}
              </div>
            )}
            <span className="text-sm font-medium">{sender?.displayName || 'Unknown user'}</span>
          </div>
        )}
        
        {/* Message content */}
        <div 
          className={`relative rounded-lg p-3 ${
            isCurrentUserMessage 
              ? 'bg-primary text-primary-foreground rounded-tr-none' 
              : 'bg-muted text-foreground rounded-tl-none'
          }`}
        >
          {isEditing ? (
            <MessageEditForm 
              initialContent={message.content}
              onSave={handleSaveEdit}
              onCancel={onCancelEdit}
            />
          ) : (
            <>
              <div className="whitespace-pre-wrap break-words">{message.content}</div>
              
              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {message.attachments.map((attachment) => (
                    <FileAttachment 
                      key={attachment.id} 
                      attachment={attachment} 
                    />
                  ))}
                </div>
              )}
              
              {/* Message status and timestamp */}
              <div className="flex justify-between items-center mt-1 text-xs opacity-70">
                <span>{formattedTime}</span>
                {message.status && (
                  <span className="capitalize">{message.status}</span>
                )}
              </div>
            </>
          )}
        </div>
        
        {/* Message reactions */}
        {!isEditing && (
          <div className={`mt-1 ${isCurrentUserMessage ? 'flex justify-end' : ''}`}>
            <MessageReactions
              reactions={convertReactions(message.reactions)}
              currentUserId={currentUserId}
              onAddReaction={handleAddReaction}
              onRemoveReaction={handleRemoveReaction}
            />
          </div>
        )}
        
        {/* Read receipts */}
        {isCurrentUserMessage && message.readBy && message.readBy.length > 0 && (
          <div className="flex justify-end mt-1">
            <ReadReceipts
              readBy={message.readBy}
              participants={participants}
              messageTimestamp={message.timestamp ? new Date(message.timestamp) : new Date()}
              status={message.status || 'sent'}
              isCurrentUserMessage={isCurrentUserMessage}
            />
          </div>
        )}
      </div>
      
      {/* Message actions */}
      {!isEditing && (isHovered || isCurrentUserMessage) && (
        <div className={`self-start mt-2 ${isCurrentUserMessage ? 'order-1 mr-2' : 'order-2 ml-2'}`}>
          <MessageActions
            messageId={message.id}
            isCurrentUserMessage={isCurrentUserMessage}
            onEdit={() => onEdit(message.id, message.content)}
            onDelete={() => onDelete(message.id)}
            onReply={() => onReply(message.id)}
            onReact={() => {}}
          />
        </div>
      )}
    </div>
  );
}; 