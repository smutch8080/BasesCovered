import React, { createContext, useEffect, useState, ReactNode, useContext } from 'react';
import { IMessagingService } from '../services/messaging/types';
import { getMessagingService } from '../services/messaging';
import { useAuth } from './AuthContext';

interface MessagingContextType {
  messagingService: IMessagingService | null;
  isInitialized: boolean;
  error: Error | null;
}

// Create the context with a more specific initial value
const defaultValue: MessagingContextType = {
  messagingService: null,
  isInitialized: false,
  error: null
};

export const MessagingContext = createContext<MessagingContextType>(defaultValue);

// Define the props interface
interface MessagingProviderProps {
  children: ReactNode;
}

// Export the component with a named function declaration instead of an arrow function
// This helps with HMR compatibility
export function MessagingProvider({ children }: MessagingProviderProps) {
  const { currentUser } = useAuth();
  const [messagingService, setMessagingService] = useState<IMessagingService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeMessaging = async () => {
      if (!currentUser) {
        console.log('No current user, disconnecting messaging service');
        if (messagingService) {
          messagingService.disconnect();
          if (isMounted) {
            setMessagingService(null);
            setIsInitialized(false);
            setError(null);
          }
        }
        return;
      }

      console.log('Initializing messaging service for user:', currentUser.id);
      
      try {
        // Get the messaging service instance
        const service = getMessagingService();
        console.log('Messaging service instance created');
        
        // Initialize the service
        await service.initialize();
        console.log('Messaging service initialized successfully');
        
        if (isMounted) {
          setMessagingService(service);
          setIsInitialized(true);
          setError(null);
          console.log('Messaging context updated with initialized service');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        console.error('Failed to initialize messaging service:', errorMsg);
        console.error('Error details:', err);
        
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize messaging service'));
          setIsInitialized(false);
          console.log('Messaging context updated with error state');
        }
      }
    };

    initializeMessaging();

    return () => {
      console.log('Cleaning up messaging context');
      isMounted = false;
      if (messagingService) {
        console.log('Disconnecting messaging service');
        messagingService.disconnect();
      }
    };
  }, [currentUser]);

  const value = {
    messagingService,
    isInitialized,
    error
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
}

// Define the hook with a named function declaration
export function useMessaging() {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
} 