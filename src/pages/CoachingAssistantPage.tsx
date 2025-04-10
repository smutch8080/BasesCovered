import React, { useState } from 'react';
import { Bot } from 'lucide-react';
import { Message } from '../types/assistant';
import { generateChatResponse, OpenAIError } from '../lib/openai';
import { AssistantTabs } from '../components/assistant/AssistantTabs';
import { ChatAssistant } from '../components/assistant/ChatAssistant';
import { PlanGenerator } from '../components/assistant/PlanGenerator';
import { ErrorDisplay } from '../components/assistant/ErrorDisplay';
import toast from 'react-hot-toast';

function CoachingAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'practice'>('chat');
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async (content: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Add user message
      const updatedMessages = [...messages, { role: 'user', content }];
      setMessages(updatedMessages);

      // Get AI response
      const response = await generateChatResponse(updatedMessages);
      
      // Add AI response
      setMessages([...updatedMessages, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      if (error instanceof OpenAIError) {
        setError(error.message);
        
        // Show specific toast messages for certain errors
        if (error.code === 'API_KEY_MISSING') {
          toast.error('AI features are currently unavailable');
        } else if (error.code === 'RATE_LIMIT') {
          toast.error('Please wait a moment before sending another message');
        } else {
          toast.error('Failed to get response from assistant');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
        toast.error('Failed to get response from assistant');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    if (messages.length > 0) {
      const lastUserMessage = messages[messages.length - 1];
      if (lastUserMessage.role === 'user') {
        handleSendMessage(lastUserMessage.content);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Bot className="w-8 h-8 text-brand-primary" />
        <h1 className="text-3xl font-bold text-gray-800">Coaching Assistant</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <AssistantTabs activeTab={activeTab} onTabChange={setActiveTab} />
        
        {activeTab === 'chat' ? (
          <>
            <ChatAssistant
              messages={messages}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
            />
            {error && (
              <div className="p-4 border-t">
                <ErrorDisplay 
                  message={error}
                  onRetry={handleRetry}
                />
              </div>
            )}
          </>
        ) : (
          <PlanGenerator />
        )}
      </div>
    </div>
  );
}

export default CoachingAssistantPage;