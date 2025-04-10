import React, { useState, useRef, useEffect } from 'react';
import { useMessages } from '../../hooks/useMessages';
import { useConversation } from '../../hooks/useConversation';
import { useAuth } from '../../contexts/AuthContext';
import { Message, Conversation, Participant } from '../../services/messaging/types';
import { formatDistanceToNow, format } from 'date-fns';
import { Avatar } from '../ui/Avatar';
import { MessageInput } from './MessageInput';
import { MessageReactions } from './MessageReactions';
import { MessageActions } from './MessageActions';
import { ReadReceipts } from './ReadReceipts';
import { MessageEditForm } from './MessageEditForm';
import { FileUploadProgress } from './FileUploadProgress';
import { Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { Message as MessageComponent } from './Message';
import { checkConversationPermission } from '../../lib/firebaseUtils';
import { getDoc, doc, getFirestore } from 'firebase/firestore';

interface MessageThreadProps {
  conversation: Conversation;
}

export const MessageThread: React.FC<MessageThreadProps> = ({ conversation }) => {
  const { currentUser } = useAuth();
  const { messages, loading, error, sendMessage, deleteMessage, editMessage, addReaction, removeReaction } = useMessages(conversation);
  const { updateConversation } = useConversation(conversation?.id || null);
  
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [fileUploads, setFileUploads] = useState<any[]>([]);
  const [permissionTestResult, setPermissionTestResult] = useState<string | null>(null);
  const [isTestingPermission, setIsTestingPermission] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Participant[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  
  // Track user presence
  const [onlineParticipants, setOnlineParticipants] = useState<string[]>([]);
  
  useEffect(() => {
    // Simulate online status for demo purposes
    // In a real app, you would use a presence system
    const online = conversation.participants
      .filter(() => Math.random() > 0.3) // Randomly set some users as online
      .map(p => p.id);
    
    setOnlineParticipants(online);
  }, [conversation.participants]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Format timestamp
  const formatMessageTime = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };
  
  // Group messages by date
  const groupedMessages = messages.reduce<Record<string, Message[]>>((groups, message) => {
    const date = format(new Date(message.timestamp), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});
  
  // Format date for display
  const formatMessageDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return 'Today';
    } else if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
      return 'Yesterday';
    } else {
      return format(date, 'MMMM d, yyyy');
    }
  };
  
  // Get sender name
  const getSenderName = (senderId: string) => {
    const participant = conversation.participants.find(p => p.id === senderId);
    return participant?.displayName || 'Unknown User';
  };
  
  // Handle sending a message
  const handleSendMessage = async (content: string, attachments: any[] = [], replyToId?: string) => {
    if (!content.trim() && attachments.length === 0) return;
    
    try {
      // Track uploads
      const uploadsWithProgress = attachments.map(file => ({
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        progress: 0,
        file
      }));
      
      if (uploadsWithProgress.length > 0) {
        setFileUploads(prev => [...prev, ...uploadsWithProgress]);
      }
      
      // Send the message
      await sendMessage(content, attachments, replyToId);
      
      // Clear reply
      setReplyToMessage(null);
      
      // Update upload progress (in a real app, this would be done via events)
      if (uploadsWithProgress.length > 0) {
        // Simulate upload progress
        const updateProgress = (id: string, progress: number) => {
          setFileUploads(prev => 
            prev.map(upload => 
              upload.id === id 
                ? { ...upload, progress } 
                : upload
            )
          );
        };
        
        // Simulate progress updates
        uploadsWithProgress.forEach(upload => {
          const interval = setInterval(() => {
            updateProgress(upload.id, Math.min(100, upload.progress + 20));
          }, 500);
          
          // Clear interval after 2.5 seconds (when progress reaches 100%)
          setTimeout(() => {
            clearInterval(interval);
            // Remove from uploads after a delay
            setTimeout(() => {
              setFileUploads(prev => prev.filter(u => u.id !== upload.id));
            }, 1000);
          }, 2500);
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Update uploads with error
      if (attachments.length > 0) {
        setFileUploads(prev => 
          prev.map(upload => ({
            ...upload,
            error: 'Failed to upload file'
          }))
        );
      }
    }
  };
  
  // Handle editing a message
  const handleEditMessage = async (messageId: string, newContent: string) => {
    try {
      await editMessage(messageId, newContent);
      setEditingMessageId(null);
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };
  
  // Handle deleting a message
  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };
  
  // Handle replying to a message
  const handleReplyMessage = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setReplyToMessage(message);
    }
  };
  
  // Handle adding a reaction
  const handleAddReaction = async (messageId: string, emoji: string) => {
    try {
      await addReaction(messageId, emoji);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };
  
  // Handle removing a reaction
  const handleRemoveReaction = async (messageId: string, emoji: string) => {
    try {
      await removeReaction(messageId, emoji);
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  };
  
  // Handle canceling a file upload
  const handleCancelUpload = (uploadId: string) => {
    setFileUploads(prev => prev.filter(upload => upload.id !== uploadId));
  };
  
  // Simulate typing indicator
  const handleTyping = () => {
    // In a real app, this would call a backend API
    console.log('User is typing');
  };
  
  // Determine if we should show the sender for a message
  const shouldShowSender = (message: Message, index: number, messagesForDay: Message[]) => {
    if (index === 0) return true;
    const prevMessage = messagesForDay[index - 1];
    return prevMessage.senderId !== message.senderId;
  };
  
  // Add a function to test permissions directly
  const testPermissions = async () => {
    if (!conversation?.id || !currentUser) {
      setPermissionTestResult('No conversation ID or user found');
      return;
    }
    
    setIsTestingPermission(true);
    setPermissionTestResult('Testing permissions...');
    
    try {
      console.log('Testing permissions for conversation:', conversation.id);
      console.log('Current user:', currentUser);
      
      // Log the conversation structure
      const db = getFirestore();
      const conversationRef = doc(db, 'conversations', conversation.id);
      const conversationDoc = await getDoc(conversationRef);
      
      if (!conversationDoc.exists()) {
        setPermissionTestResult(`Conversation ${conversation.id} does not exist in Firestore`);
        setIsTestingPermission(false);
        return;
      }
      
      const conversationData = conversationDoc.data();
      console.log('Conversation data from Firestore:', conversationData);
      
      // Check if the current user is in the participants
      let isParticipant = false;
      // Use a type assertion to access potential uid property
      const currentUserId = (currentUser as any).uid || currentUser.id;
      
      if (Array.isArray(conversationData.participants)) {
        // Check if participants is an array of objects with id property
        isParticipant = conversationData.participants.some((p: any) => 
          (typeof p === 'object' && p !== null && p.id === currentUserId)
        );
        
        if (!isParticipant) {
          // Check if participants is an array of strings
          isParticipant = conversationData.participants.some((p: any) => 
            (typeof p === 'string' && p === currentUserId)
          );
        }
      }
      
      // Check if there's a participantIds array
      if (!isParticipant && Array.isArray(conversationData.participantIds)) {
        isParticipant = conversationData.participantIds.includes(currentUserId);
      }
      
      console.log('Is user a participant according to direct check:', isParticipant);
      
      // Now try the permission check function
      await checkConversationPermission(conversation.id);
      setPermissionTestResult('Permission check passed! You have access to this conversation.');
    } catch (error) {
      console.error('Permission test failed:', error);
      setPermissionTestResult(`Permission check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTestingPermission(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="animate-pulse">Loading messages...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="flex items-center text-destructive mb-4">
          <AlertCircle className="w-6 h-6 mr-2" />
          <h3 className="text-lg font-medium">Error Loading Messages</h3>
        </div>
        <p className="text-center text-muted-foreground mb-6">
          {error.toString().includes('permission') 
            ? "You may not have permission to view this conversation. Please check if you're a participant."
            : error.toString()}
        </p>
        
        <button
          onClick={testPermissions}
          disabled={isTestingPermission}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          <ShieldCheck className="w-4 h-4 mr-2" />
          {isTestingPermission ? 'Testing...' : 'Test Permissions'}
        </button>
        
        {permissionTestResult && (
          <div className="mt-4 p-4 bg-muted rounded-md max-w-md">
            <p className="text-sm">{permissionTestResult}</p>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full" ref={threadRef}>
      {/* Conversation header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center">
          <Avatar 
            src={conversation.type === 'direct' 
              ? conversation.participants.find(p => p.id !== currentUser?.id)?.profilePictureUrl || null
              : null
            } 
            name={conversation.type === 'direct'
              ? conversation.participants.find(p => p.id !== currentUser?.id)?.displayName || 'Conversation'
              : conversation.metadata?.groupName || 'Group'
            }
            size="md"
          />
          <div className="ml-3">
            <h2 className="font-semibold">
              {conversation.type === 'direct'
                ? conversation.participants.find(p => p.id !== currentUser?.id)?.displayName || 'Conversation'
                : conversation.metadata?.groupName || 'Group'
              }
            </h2>
            <p className="text-xs text-muted-foreground">
              {conversation.type === 'direct' 
                ? onlineParticipants.includes(
                    conversation.participants.find(p => p.id !== currentUser?.id)?.id || ''
                  )
                  ? 'Online'
                  : 'Offline'
                : `${conversation.participants.length} participants`
              }
            </p>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {Object.entries(groupedMessages).map(([date, messagesForDay]) => (
          <div key={date}>
            <div className="flex justify-center my-4">
              <div className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                {formatMessageDate(date)}
              </div>
            </div>
            
            {messagesForDay.map((message, index) => (
              <MessageComponent
                key={message.id}
                message={message}
                isCurrentUserMessage={message.senderId === currentUser?.id}
                currentUserId={currentUser?.id || ''}
                participants={conversation.participants}
                showSender={shouldShowSender(message, index, messagesForDay)}
                isEditing={editingMessageId === message.id}
                onEdit={handleEditMessage}
                onDelete={handleDeleteMessage}
                onReply={handleReplyMessage}
                onAddReaction={handleAddReaction}
                onRemoveReaction={handleRemoveReaction}
                onCancelEdit={() => setEditingMessageId(null)}
              />
            ))}
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Reply preview */}
      {replyToMessage && (
        <div className="px-4 pt-2 border-t border-border bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-muted-foreground">
              <span className="mr-1">Replying to</span>
              <span className="font-medium">{getSenderName(replyToMessage.senderId)}</span>
            </div>
            <button 
              onClick={() => setReplyToMessage(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              &times;
            </button>
          </div>
          <div className="text-xs text-muted-foreground truncate mb-2">
            {replyToMessage.content}
          </div>
        </div>
      )}
      
      {/* File upload progress */}
      {fileUploads.length > 0 && (
        <div className="px-4 pt-2 border-t border-border bg-muted/50 space-y-2">
          {fileUploads.map(upload => (
            <FileUploadProgress
              key={upload.id}
              file={upload}
              onCancel={() => handleCancelUpload(upload.id)}
            />
          ))}
        </div>
      )}
      
      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-1 text-xs text-muted-foreground">
          {typingUsers
            .filter((user: Participant) => user.id !== currentUser?.id)
            .map((user: Participant) => user.displayName)
            .join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </div>
      )}
      
      {/* Message input */}
      <div className="p-4 border-t border-border">
        <MessageInput 
          conversationId={conversation.id}
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          replyToMessage={replyToMessage}
          onCancelReply={() => setReplyToMessage(null)}
        />
      </div>
    </div>
  );
}; 