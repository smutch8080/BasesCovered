import { useContext } from 'react';
import { MessagingContext } from '../contexts/MessagingContext';
import { IMessagingService } from '../services/messaging/types';

/**
 * Hook to access the messaging service from the MessagingContext
 * @returns The messaging service instance
 */
export function useMessagingService(): IMessagingService | null {
  const context = useContext(MessagingContext);
  
  if (!context) {
    console.warn('useMessagingService must be used within a MessagingProvider');
    return null;
  }
  
  if (!context.messagingService) {
    console.warn('Messaging service is not initialized yet');
    if (context.error) {
      console.error('Messaging service initialization error:', context.error.message);
    }
  }
  
  return context.messagingService;
} 