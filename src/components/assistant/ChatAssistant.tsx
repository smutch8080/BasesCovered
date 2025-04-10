import React from 'react';
import { Bot } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { Message } from '../../types/assistant';

interface Props {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string) => void;
}

export const ChatAssistant: React.FC<Props> = ({ messages, isLoading, onSendMessage }) => {
  return (
    <div className="h-[600px] flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <Bot className="w-12 h-12 mb-4" />
            <p className="text-lg font-medium mb-2">How can I help you today?</p>
            <p className="text-sm">Ask me anything about softball coaching!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessage
              key={index}
              role={message.role}
              content={message.content}
            />
          ))
        )}
      </div>
      <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
    </div>
  );
};