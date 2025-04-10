import { useState, useEffect, useCallback } from 'react';
import { useMessaging } from '../contexts/MessagingContext';
import { Conversation } from '../services/messaging/types';

export const useConversations = (limit = 20, sortBy = 'lastMessageAt') => {
  const { messagingService, isInitialized } = useMessaging();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!messagingService || !isInitialized) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const options = { limit, sortBy };
      const result = await messagingService.getConversations(options);
      setConversations(result);
      setError(null);
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setError(err instanceof Error ? err : new Error('Failed to load conversations'));
    } finally {
      setLoading(false);
    }
  }, [messagingService, isInitialized, limit, sortBy]);

  // Effect to load initial conversations and set up real-time listener
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeConversations = async () => {
      if (!messagingService || !isInitialized) {
        setLoading(false);
        return;
      }

      try {
        // Initial load
        await loadConversations();

        // Set up real-time listener
        unsubscribe = messagingService.subscribeToConversations((updatedConversations: Conversation[]) => {
          console.log('Conversations updated:', updatedConversations.length);
          setConversations(updatedConversations);
        });
      } catch (err) {
        console.error('Error setting up conversations listener:', err);
        setError(err instanceof Error ? err : new Error('Error setting up conversations listener'));
        setLoading(false);
      }
    };

    initializeConversations();

    // Clean up listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [messagingService, isInitialized, loadConversations]);

  // Refresh conversations
  const refreshConversations = useCallback(() => {
    return loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    loading,
    error,
    refreshConversations
  };
}; 