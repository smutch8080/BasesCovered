import React, { useState } from 'react';
import { Participant } from '../../services/messaging/types';
import { Check, CheckCheck, Clock, Send, AlertCircle } from 'lucide-react';

interface ReadReceiptsProps {
  readBy: string[];
  participants: Participant[];
  messageTimestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  isCurrentUserMessage: boolean;
}

export function ReadReceipts({
  readBy,
  participants,
  messageTimestamp,
  status,
  isCurrentUserMessage
}: ReadReceiptsProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  // Only show read receipts for current user's messages
  if (!isCurrentUserMessage) return null;
  
  // Filter participants who have read the message
  const readByParticipants = participants.filter(p => readBy.includes(p.id));
  const notReadByParticipants = participants.filter(p => !readBy.includes(p.id));
  
  // Format timestamp
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  // Render status icon
  const renderStatusIcon = () => {
    switch (status) {
      case 'sending':
        return <Clock size={12} className="text-muted-foreground" />;
      case 'sent':
        return <Check size={12} className="text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck size={12} className="text-muted-foreground" />;
      case 'read':
        return <CheckCheck size={12} className="text-primary" />;
      case 'failed':
        return <AlertCircle size={12} className="text-destructive" />;
      default:
        return <Send size={12} className="text-muted-foreground" />;
    }
  };
  
  return (
    <div className="flex items-center justify-end mt-1 space-x-1">
      {/* Status indicator */}
      <div 
        className="flex items-center cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <span className="text-xs text-muted-foreground mr-1">
          {formatTime(messageTimestamp)}
        </span>
        {renderStatusIcon()}
      </div>
      
      {/* Read receipt details popup */}
      {showDetails && (
        <div className="absolute bottom-full right-0 mb-2 p-2 bg-background border border-border rounded-lg shadow-md z-10 text-xs w-48">
          <div className="font-medium mb-1">Read status</div>
          
          {/* Read by */}
          {readByParticipants.length > 0 && (
            <div className="mb-2">
              <div className="text-primary flex items-center mb-1">
                <CheckCheck size={12} className="mr-1" />
                <span>Read by</span>
              </div>
              <ul className="pl-4">
                {readByParticipants.map(participant => (
                  <li key={participant.id} className="truncate">
                    {participant.displayName}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Not read by */}
          {notReadByParticipants.length > 0 && (
            <div>
              <div className="text-muted-foreground flex items-center mb-1">
                <Clock size={12} className="mr-1" />
                <span>Not read by</span>
              </div>
              <ul className="pl-4">
                {notReadByParticipants.map(participant => (
                  <li key={participant.id} className="truncate">
                    {participant.displayName}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 