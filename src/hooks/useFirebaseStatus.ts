import { useState, useEffect, useCallback } from 'react';
import { checkFirebaseConnection } from '../lib/firebaseUtils';

export function useFirebaseStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = useCallback(async () => {
    setIsChecking(true);
    try {
      const isConnected = await checkFirebaseConnection();
      setIsConnected(isConnected);
      if (isConnected) {
        setError(null);
      }
    } catch (err) {
      setIsConnected(false);
      setError(err instanceof Error ? err : new Error('Unknown error checking Firebase connection'));
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Check connection on mount
  useEffect(() => {
    checkConnection();
    
    // Set up periodic checking (every 30 seconds)
    const intervalId = setInterval(() => {
      checkConnection();
    }, 30000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [checkConnection]);

  return {
    isConnected,
    error,
    isChecking,
    checkConnection
  };
} 