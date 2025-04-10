import React, { useEffect, useRef } from 'react';
import { Message } from '../../types/messages';
import { useAuth } from '../../contexts/AuthContext';
import { formatTime } from '../../utils/dateUtils';

interface Props {
  messages: Message[];
  isTeamChat?: boolean;
}

export const MessageList: React.FC<Props> = ({ messages, isTeamChat }) => {
  const { currentUser } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!messages.length) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-gray-500">
        No messages yet. Start the conversation!
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 bg-gray-50">
      {messages.map((message) => {
        const isOwnMessage = message.senderId === currentUser?.id;
        const isUnread = !message.readBy?.includes(currentUser?.id || '');

        return (
          <div
            key={message.id}
            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} max-w-full`}
          >
            <div
              className={`max-w-[85%] md:max-w-[70%] rounded-lg p-3 space-y-1 break-words relative
                ${isOwnMessage 
                  ? 'bg-brand-primary text-white rounded-br-none' 
                  : 'bg-white border border-gray-200 rounded-bl-none text-gray-800'
                }
                ${isUnread ? 'ring-2 ring-brand-accent ring-offset-2' : ''}
              `}
            >
              {!isOwnMessage && isTeamChat && (
                <p className={`text-xs font-medium ${isOwnMessage ? 'text-white/90' : 'text-brand-primary'} mb-1`}>
                  {message.senderName}
                </p>
              )}
              <p className={`text-sm md:text-base whitespace-pre-wrap ${isOwnMessage ? 'text-white' : 'text-gray-800'}`}>
                {message.content}
              </p>
              <p className={`text-[10px] md:text-xs ${isOwnMessage ? 'text-white/80' : 'text-gray-500'}`}>
                {formatTime(message.createdAt)}
              </p>
              {isUnread && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-brand-accent rounded-full" />
              )}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};