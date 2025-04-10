import React, { useState } from 'react';
import { useConversations, useConnectionStatus } from '../hooks';
import { ConversationList } from '../components/messaging/ConversationList';
import { MessageThread } from '../components/messaging/MessageThread';
import { NewConversationModal } from '../components/messaging/NewConversationModal';
import { ConversationDetails } from '../components/messaging/ConversationDetails';
import { Wifi, WifiOff, Plus, Info } from 'lucide-react';

const MessagingPage: React.FC = () => {
  const { conversations, loading: conversationsLoading } = useConversations();
  const { connectionStatus, reconnect } = useConnectionStatus();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
  const [showConversationDetails, setShowConversationDetails] = useState(false);

  // Find the selected conversation from the list
  const selectedConversation = selectedConversationId 
    ? conversations.find(c => c.id === selectedConversationId) 
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
        <div className="flex items-center gap-4">
          {/* Connection status indicator */}
          <div 
            className="flex items-center gap-2 text-sm"
            title={`Status: ${connectionStatus}`}
          >
            {connectionStatus === 'connected' ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : connectionStatus === 'connecting' ? (
              <Wifi className="w-5 h-5 text-yellow-500" />
            ) : (
              <button 
                onClick={reconnect}
                className="flex items-center gap-1 text-red-500 hover:text-red-600"
                title="Click to reconnect"
              >
                <WifiOff className="w-5 h-5" />
                <span>Disconnected</span>
              </button>
            )}
          </div>
          
          {/* New conversation button */}
          <button
            onClick={() => setIsNewConversationModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            <span>New Message</span>
          </button>
        </div>
      </div>

      <div className="bg-background rounded-lg shadow-md overflow-hidden">
        <div className="flex h-[calc(80vh)]">
          {/* Conversation list sidebar */}
          <div className="w-1/4 border-r border-border">
            <ConversationList
              conversations={conversations}
              loading={conversationsLoading}
              selectedConversationId={selectedConversationId}
              onSelectConversation={setSelectedConversationId}
            />
          </div>
          
          {/* Message thread */}
          <div className={`${showConversationDetails ? 'w-1/2' : 'w-3/4'} flex flex-col`}>
            {selectedConversation ? (
              <>
                <div className="flex justify-between items-center p-4 border-b border-border">
                  <h2 className="font-semibold">
                    {selectedConversation.type === 'direct'
                      ? selectedConversation.participants.find(p => p.id !== selectedConversation.participants[0].id)?.displayName || 'Conversation'
                      : selectedConversation.metadata?.groupName || 'Group'
                    }
                  </h2>
                  <button
                    onClick={() => setShowConversationDetails(!showConversationDetails)}
                    className={`p-2 rounded-full ${showConversationDetails ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                    title="Conversation details"
                  >
                    <Info size={20} />
                  </button>
                </div>
                <MessageThread
                  conversation={selectedConversation}
                  key={selectedConversation.id}
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-muted-foreground">
                <div className="text-center">
                  <p className="mb-4">Select a conversation or start a new one</p>
                  <button
                    onClick={() => setIsNewConversationModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Message</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Conversation details */}
          {showConversationDetails && selectedConversation && (
            <div className="w-1/4 border-l border-border">
              <ConversationDetails
                conversation={selectedConversation}
                onClose={() => setShowConversationDetails(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* New conversation modal */}
      {isNewConversationModalOpen && (
        <NewConversationModal
          onClose={() => setIsNewConversationModalOpen(false)}
          onConversationCreated={(conversationId: string) => {
            setSelectedConversationId(conversationId);
            setIsNewConversationModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default MessagingPage; 