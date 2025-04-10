import { useState, useEffect, useCallback, useMemo } from 'react';
import { getMessagingService } from '../services/messaging';
import { UserPresenceStatus, Unsubscribe } from '../services/messaging/types';

// Define UserPresence interface
interface UserPresence {
  status: UserPresenceStatus;
  lastSeen?: Date;
}

export function useUserPresence(userIds: string[]) {
  const messagingService = getMessagingService();
  const [userPresence, setUserPresence] = useState<Record<string, UserPresence>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Memoize the userIds array to prevent unnecessary re-renders
  const memoizedUserIds = useMemo(() => {
    return [...userIds].sort().join(',');
  }, [userIds]);

  useEffect(() => {
    if (!userIds.length) {
      setUserPresence({});
      return;
    }

    setLoading(true);
    setError(null);

    // Since there's no direct method to get user presence in the interface,
    // we'll initialize with all users as offline and rely on subscriptions
    const initialPresence: Record<string, UserPresence> = {};
    userIds.forEach(userId => {
      initialPresence[userId] = {
        status: 'offline',
        lastSeen: undefined
      };
    });
    
    setUserPresence(initialPresence);
    setLoading(false);

    // We need to extend the messaging service to support user presence subscriptions
    // For now, we'll create a placeholder that doesn't actually subscribe
    const subscribeToUserStatus = (
      userId: string, 
      callback: (status: UserPresenceStatus) => void
    ): Unsubscribe => {
      // This would normally set up a Firebase listener for user presence
      console.log(`Subscribing to presence for user ${userId}`);
      
      // Return a no-op unsubscribe function
      return () => {
        console.log(`Unsubscribing from presence for user ${userId}`);
      };
    };

    // Subscribe to presence updates for all users
    const unsubscribes = userIds.map(userId => 
      subscribeToUserStatus(userId, (status: UserPresenceStatus) => {
        setUserPresence(prev => ({
          ...prev,
          [userId]: {
            status,
            lastSeen: new Date()
          }
        }));
      })
    );

    return () => {
      // Unsubscribe from all presence subscriptions
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [memoizedUserIds]); // Use the memoized string instead of the array

  return {
    userPresence,
    loading,
    error
  };
} 