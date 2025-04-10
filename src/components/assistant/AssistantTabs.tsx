import React from 'react';
import { Bot, ClipboardList } from 'lucide-react';

interface Props {
  activeTab: 'chat' | 'practice';
  onTabChange: (tab: 'chat' | 'practice') => void;
}

export const AssistantTabs: React.FC<Props> = ({ activeTab, onTabChange }) => {
  return (
    <div className="border-b">
      <div className="flex">
        <button
          onClick={() => onTabChange('chat')}
          className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors
            ${activeTab === 'chat' 
              ? 'text-brand-primary border-b-2 border-brand-primary' 
              : 'text-gray-600 hover:text-gray-800'}`}
        >
          <Bot className="w-4 h-4" />
          Chat
        </button>
        <button
          onClick={() => onTabChange('practice')}
          className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors
            ${activeTab === 'practice' 
              ? 'text-brand-primary border-b-2 border-brand-primary' 
              : 'text-gray-600 hover:text-gray-800'}`}
        >
          <ClipboardList className="w-4 h-4" />
          Generate Practice Plan
        </button>
      </div>
    </div>
  );
};