import { useState, useEffect, useCallback } from 'react';
import { useMessaging } from '../contexts/MessagingContext';
import { Conversation } from '../services/messaging/types';
import { useAuth } from '../contexts/AuthContext';
import { checkConversationPermission } from '../lib/firebaseUtils';

export const useConversation = (conversationId: string | null) => {
  const { messagingService, isInitialized } = useMessaging();
  const { currentUser } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load a single conversation by ID
  useEffect(() => {
    if (!conversationId || !messagingService || !isInitialized) {
      setConversation(null);
      setLoading(false);
      return;
    }

    const loadConversation = async () => {
      try {
        setLoading(true);
        const result = await messagingService.getConversationById(conversationId);
        setConversation(result);
        setError(null);
      } catch (err) {
        console.error(`Failed to load conversation ${conversationId}:`, err);
        setError(err instanceof Error ? err : new Error(`Failed to load conversation ${conversationId}`));
        setConversation(null);
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [conversationId, messagingService, isInitialized]);

  // Update a conversation
  const updateConversation = useCallback(
    async (data: Partial<Conversation>) => {
      if (!conversationId || !messagingService) {
        throw new Error('Cannot update conversation: missing conversationId or messagingService');
      }

      try {
        await messagingService.updateConversation(conversationId, data);
        
        // Update local state
        setConversation(prev => prev ? { ...prev, ...data } : null);
        
        return true;
      } catch (err) {
        console.error('Error updating conversation:', err);
        throw err;
      }
    },
    [conversationId, messagingService]
  );

  // Delete a conversation
  const deleteConversation = useCallback(async () => {
    if (!conversationId || !messagingService) {
      throw new Error('Cannot delete conversation: missing conversationId or messagingService');
    }

    try {
      await messagingService.deleteConversation(conversationId);
      return true;
    } catch (err) {
      console.error('Error deleting conversation:', err);
      throw err;
    }
  }, [conversationId, messagingService]);

  // Mark conversation as read
  const markAsRead = useCallback(async () => {
    if (!conversationId || !messagingService || !currentUser) {
      return false;
    }

    try {
      await messagingService.markAsRead(conversationId);
      return true;
    } catch (err) {
      console.error('Error marking conversation as read:', err);
      return false;
    }
  }, [conversationId, messagingService, currentUser]);

  // Add participant to conversation
  const addParticipant = useCallback(async (userId: string, displayName: string) => {
    if (!conversationId || !conversation) return false;
    
    try {
      // Check if user is already a participant
      if (conversation.participants.some(p => p.id === userId)) {
        return true; // User is already a participant
      }
      
      // Add the new participant
      const updatedParticipants = [
        ...conversation.participants,
        {
          id: userId,
          displayName,
          role: 'member' as const,
          joinedAt: new Date()
        }
      ];
      
      await updateConversation({ participants: updatedParticipants });
      return true;
    } catch (err) {
      console.error('Error adding participant:', err);
      setError(err instanceof Error ? err : new Error('Failed to add participant'));
      return false;
    }
  }, [conversationId, conversation, updateConversation]);

  // Remove participant from conversation
  const removeParticipant = useCallback(async (userId: string) => {
    if (!conversationId || !conversation) return false;
    
    try {
      // Filter out the participant to remove
      const updatedParticipants = conversation.participants.filter(p => p.id !== userId);
      
      // Ensure we're not removing all participants
      if (updatedParticipants.length === 0) {
        throw new Error('Cannot remove all participants from a conversation');
      }
      
      await updateConversation({ participants: updatedParticipants });
      return true;
    } catch (err) {
      console.error('Error removing participant:', err);
      setError(err instanceof Error ? err : new Error('Failed to remove participant'));
      return false;
    }
  }, [conversationId, conversation, updateConversation]);

  return {
    conversation,
    loading,
    error,
    updateConversation,
    deleteConversation,
    markAsRead,
    addParticipant,
    removeParticipant
  };
}; 