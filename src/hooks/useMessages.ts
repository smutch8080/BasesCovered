import { useState, useEffect, useCallback } from 'react';
import { useMessaging } from '../contexts/MessagingContext';
import { Message, Conversation } from '../services/messaging/types';
import { useAuth } from '../contexts/AuthContext';

export const useMessages = (conversation: Conversation | null) => {
  const { messagingService, isInitialized } = useMessaging();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load messages for a conversation
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const loadMessages = async () => {
      if (!messagingService || !isInitialized || !conversation?.id || !currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Subscribe to message updates
        unsubscribe = messagingService.subscribeToMessages(conversation.id, (updatedMessages: Message[]) => {
          console.log(`Received ${updatedMessages.length} messages for conversation ${conversation.id}`);
          setMessages(updatedMessages);
          setLoading(false);
          
          // Mark messages as read
          if (updatedMessages.length > 0) {
            messagingService.markAsRead(conversation.id)
              .catch(err => console.error('Error marking messages as read:', err));
          }
        });
      } catch (err) {
        console.error('Error loading messages:', err);
        setError(err instanceof Error ? err : new Error('Failed to load messages'));
        setLoading(false);
      }
    };

    loadMessages();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [messagingService, isInitialized, conversation, currentUser]);

  // Send a message
  const sendMessage = useCallback(async (
    content: string, 
    attachments: any[] = [], 
    replyToId?: string
  ) => {
    if (!messagingService || !conversation?.id) {
      throw new Error('Cannot send message: messagingService or conversation not available');
    }

    try {
      return await messagingService.sendMessage(conversation.id, {
        content,
        attachments: attachments.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size,
          url: '', // Will be filled by the service
          uploadedAt: new Date()
        })),
        replyTo: replyToId,
      });
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  }, [messagingService, conversation]);

  // Edit a message
  const editMessage = useCallback(async (messageId: string, content: string) => {
    if (!messagingService) {
      throw new Error('Cannot edit message: messagingService not available');
    }

    try {
      await messagingService.updateMessage(messageId, {
        content,
        isEdited: true,
        updatedAt: new Date()
      });
    } catch (err) {
      console.error('Error editing message:', err);
      throw err;
    }
  }, [messagingService]);

  // Delete a message
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!messagingService) {
      throw new Error('Cannot delete message: messagingService not available');
    }

    try {
      await messagingService.deleteMessage(messageId);
    } catch (err) {
      console.error('Error deleting message:', err);
      throw err;
    }
  }, [messagingService]);

  // Add a reaction to a message
  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!messagingService || !currentUser) {
      throw new Error('Cannot add reaction: messagingService or user not available');
    }

    const message = messages.find(m => m.id === messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    // Create a new reactions array if it doesn't exist
    const reactions = message.reactions || [];
    
    // Check if the user already added this reaction
    const existingReactionIndex = reactions.findIndex(
      r => r.emoji === emoji && r.userId === currentUser.id
    );

    if (existingReactionIndex !== -1) {
      // User already added this reaction, so we don't need to add it again
      return;
    }

    // Add the new reaction
    const updatedReactions = [
      ...reactions,
      {
        emoji,
        userId: currentUser.id,
        userName: currentUser.displayName || 'User',
        timestamp: new Date()
      }
    ];

    try {
      await messagingService.updateMessage(messageId, {
        reactions: updatedReactions
      });
    } catch (err) {
      console.error('Error adding reaction:', err);
      throw err;
    }
  }, [messagingService, currentUser, messages]);

  // Remove a reaction from a message
  const removeReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!messagingService || !currentUser) {
      throw new Error('Cannot remove reaction: messagingService or user not available');
    }

    const message = messages.find(m => m.id === messageId);
    if (!message || !message.reactions) {
      throw new Error('Message or reactions not found');
    }

    // Filter out the user's reaction with the specified emoji
    const updatedReactions = message.reactions.filter(
      r => !(r.emoji === emoji && r.userId === currentUser.id)
    );

    // If nothing changed, no need to update
    if (updatedReactions.length === message.reactions.length) {
      return;
    }

    try {
      await messagingService.updateMessage(messageId, {
        reactions: updatedReactions
      });
    } catch (err) {
      console.error('Error removing reaction:', err);
      throw err;
    }
  }, [messagingService, currentUser, messages]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction
  };
}; 