import React from 'react';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatMessage: React.FC<Props> = ({ role, content }) => {
  return (
    <div className={`flex gap-4 p-4 ${role === 'assistant' ? 'bg-gray-50' : ''}`}>
      <div className="flex-shrink-0">
        {role === 'assistant' ? (
          <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
        )}
      </div>
      <div className="flex-1 prose max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
};