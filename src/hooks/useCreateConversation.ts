import { useState } from 'react';
import { useMessaging } from '../contexts/MessagingContext';
import { ConversationCreateData } from '../services/messaging/types';
import { useAuth } from '../contexts/AuthContext';
import { createConversationDirect } from '../lib/directMessaging';
import { checkFirebaseConnection } from '../lib/firebaseUtils';

export function useCreateConversation() {
  const { messagingService } = useMessaging();
  const { currentUser } = useAuth();
  const [error, setError] = useState<Error | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const createConversation = async (data: ConversationCreateData) => {
    setIsCreating(true);
    setError(null);
    
    try {
      console.log('Checking Firebase connection before creating conversation...');
      console.log('Current data:', JSON.stringify(data, null, 2));
      
      // Check if navigator is online first
      if (!navigator.onLine) {
        console.error('Browser reports offline status');
        const connectionError = new Error('Browser reports offline status');
        setError(connectionError);
        setIsCreating(false);
        throw connectionError;
      }
      
      // Then do a more thorough check
      const isConnected = await checkFirebaseConnection();
      console.log('Connection check result:', isConnected);
      
      if (!isConnected) {
        const connectionError = new Error('Firebase connection is not available');
        console.error(connectionError);
        setError(connectionError);
        setIsCreating(false);
        throw connectionError;
      }
      
      // Validate required data
      if (!data.participantIds || data.participantIds.length === 0) {
        const validationError = new Error('Participant IDs are required');
        console.error(validationError);
        setError(validationError);
        setIsCreating(false);
        throw validationError;
      }
      
      // Ensure all participant IDs are strings and not empty
      const validParticipantIds = data.participantIds.filter(id => typeof id === 'string' && id.trim() !== '');
      console.log('Valid participant IDs:', validParticipantIds);
      
      if (validParticipantIds.length === 0) {
        const validationError = new Error('No valid participant IDs provided');
        console.error(validationError);
        setError(validationError);
        setIsCreating(false);
        throw validationError;
      }
      
      // Sanitize the data to ensure no undefined values
      const sanitizedData: ConversationCreateData = {
        type: data.type || 'direct',
        participantIds: validParticipantIds,
        initialMessage: data.initialMessage || '',
        metadata: data.metadata || {}
      };
      
      // Only add optional fields if they are defined and valid
      if (data.teamId && typeof data.teamId === 'string' && data.teamId.trim() !== '') {
        sanitizedData.teamId = data.teamId.trim();
      }
      
      if (data.teamName && typeof data.teamName === 'string' && data.teamName.trim() !== '') {
        sanitizedData.teamName = data.teamName.trim();
      }
      
      if (data.groupType) {
        sanitizedData.groupType = data.groupType;
      }
      
      console.log('Creating conversation with sanitized data:', JSON.stringify(sanitizedData, null, 2));
      
      // Try using the messaging service first
      if (messagingService) {
        try {
          console.log('Using messaging service to create conversation');
          const conversation = await messagingService.createConversation(sanitizedData);
          console.log('Conversation created successfully via messaging service:', conversation);
          setIsCreating(false);
          return conversation;
        } catch (serviceError) {
          console.error('Error creating conversation via messaging service:', serviceError);
          if (serviceError instanceof Error) {
            console.error('Error details:', {
              name: serviceError.name,
              message: serviceError.message,
              stack: serviceError.stack
            });
          }
          console.log('Falling back to direct implementation...');
          // Fall through to direct implementation
        }
      } else {
        console.log('No messaging service available, using direct implementation');
      }
      
      // Fallback to direct implementation
      if (!currentUser) {
        const authError = new Error('No authenticated user found');
        console.error(authError);
        setError(authError);
        setIsCreating(false);
        throw authError;
      }
      
      console.log('Using direct implementation to create conversation');
      console.log('Current user:', currentUser);
      
      try {
        // Ensure current user ID is included in participants if it's a direct message
        if (sanitizedData.type === 'direct' && !sanitizedData.participantIds.includes(currentUser.id)) {
          console.log('Adding current user to participants list');
          sanitizedData.participantIds.push(currentUser.id);
        }
        
        const conversation = await createConversationDirect(
          sanitizedData,
          currentUser.id,
          currentUser.displayName || 'You'
        );
        
        console.log('Conversation created successfully via direct implementation:', conversation);
        setIsCreating(false);
        return conversation;
      } catch (directError) {
        console.error('Error in direct conversation creation:', directError);
        if (directError instanceof Error) {
          console.error('Direct error details:', {
            name: directError.name,
            message: directError.message,
            stack: directError.stack
          });
          
          // Provide more specific error message
          if (directError.message.includes('undefined') || directError.message.includes('null')) {
            const dataFormatError = new Error('Invalid data format: Some required fields are missing or undefined');
            console.error('Data format error details:', {
              sanitizedData,
              currentUser: {
                id: currentUser.id,
                displayName: currentUser.displayName
              }
            });
            setError(dataFormatError);
            setIsCreating(false);
            throw dataFormatError;
          }
        }
        setError(directError instanceof Error ? directError : new Error('Unknown error in direct conversation creation'));
        setIsCreating(false);
        throw directError;
      }
    } catch (error) {
      console.error('Error in useCreateConversation:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      } else {
        console.error('Unknown error type:', error);
      }
      
      setError(error instanceof Error ? error : new Error('Unknown error creating conversation'));
      setIsCreating(false);
      throw error;
    }
  };

  return {
    createConversation,
    error,
    isCreating
  };
} 