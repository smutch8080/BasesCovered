import { useState, useEffect, useCallback } from 'react';
import { useMessaging } from '../contexts/MessagingContext';
import { ConnectionStatus } from '../services/messaging/types';

export const useConnectionStatus = () => {
  const { messagingService, isInitialized } = useMessaging();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

  // Update connection status from the service
  const updateConnectionStatus = useCallback(() => {
    if (messagingService) {
      const status = messagingService.getConnectionStatus();
      setConnectionStatus(status);
      return status;
    }
    return 'disconnected' as ConnectionStatus;
  }, [messagingService]);

  // Effect to initialize status and setup polling
  useEffect(() => {
    if (!messagingService) {
      setConnectionStatus('disconnected');
      return;
    }

    // Initial status update
    updateConnectionStatus();
    
    // Setup polling
    const intervalId = setInterval(() => {
      const status = updateConnectionStatus();
      
      // If reconnection is needed and we're not already connecting
      if (status === 'disconnected' && isInitialized && messagingService) {
        console.log('Auto-reconnecting messaging service...');
        messagingService.initialize().catch(err => {
          console.error('Failed to auto-reconnect:', err);
        });
      }
    }, 5000);

    // Cleanup interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [messagingService, isInitialized, updateConnectionStatus]);

  // Reconnect function
  const reconnect = useCallback(async () => {
    if (!messagingService) {
      console.error('Cannot reconnect: No messaging service available');
      return;
    }

    try {
      setConnectionStatus('connecting');
      await messagingService.initialize();
      updateConnectionStatus();
    } catch (error) {
      console.error('Failed to reconnect:', error);
      setConnectionStatus('disconnected');
    }
  }, [messagingService, updateConnectionStatus]);

  // Disconnect function
  const disconnect = useCallback(() => {
    if (messagingService) {
      messagingService.disconnect();
      setConnectionStatus('disconnected');
    }
  }, [messagingService]);

  const isConnected = connectionStatus === 'connected';
  const isConnecting = connectionStatus === 'connecting';
  const isDisconnected = connectionStatus === 'disconnected';

  return {
    connectionStatus,
    reconnect,
    disconnect,
    isConnected,
    isConnecting,
    isDisconnected
  };
}; 