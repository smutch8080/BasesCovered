import { 
  addDoc, 
  collection, 
  serverTimestamp, 
  getDoc, 
  doc, 
  updateDoc,
  arrayUnion,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  Conversation, 
  ConversationCreateData, 
  Message, 
  Participant 
} from '../services/messaging/types';

/**
 * Creates a conversation directly in Firestore
 * @param data The conversation data
 * @param currentUserId The current user's ID
 * @param currentUserName The current user's display name
 * @returns The created conversation
 */
export async function createConversationDirect(
  data: ConversationCreateData,
  currentUserId: string,
  currentUserName: string
): Promise<Conversation> {
  console.log('Direct conversation creation with:', {
    data,
    currentUserId,
    currentUserName
  });
  
  if (!currentUserId) {
    const error = new Error('Current user ID is required');
    console.error(error);
    throw error;
  }
  
  if (!data.participantIds || !Array.isArray(data.participantIds) || data.participantIds.length === 0) {
    const error = new Error('Participant IDs are required and must be a non-empty array');
    console.error(error);
    throw error;
  }
  
  // Ensure current user is included in participants
  let participantIds = [...data.participantIds];
  if (!participantIds.includes(currentUserId)) {
    console.log('Adding current user to participants');
    participantIds.push(currentUserId);
  }
  
  // Filter out any invalid participant IDs
  participantIds = participantIds.filter(id => typeof id === 'string' && id.trim() !== '');
  
  if (participantIds.length === 0) {
    const error = new Error('No valid participant IDs provided');
    console.error(error);
    throw error;
  }
  
  console.log('Final participant IDs:', participantIds);
  
  // Get participant details
  const participantDetails: Participant[] = [];
  
  try {
    // Add current user first
    participantDetails.push({
      id: currentUserId,
      displayName: currentUserName,
      role: 'owner',
      joinedAt: new Date()
    });
    
    // Get other participants
    for (const participantId of participantIds) {
      // Skip current user as we already added them
      if (participantId === currentUserId) continue;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', participantId));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          participantDetails.push({
            id: participantId,
            displayName: userData.displayName || 'Unknown User',
            profilePicture: userData.profilePicture || null,
            role: 'member',
            joinedAt: new Date()
          });
        } else {
          console.warn(`User document not found for ID: ${participantId}`);
          participantDetails.push({
            id: participantId,
            displayName: 'Unknown User',
            role: 'member',
            joinedAt: new Date()
          });
        }
      } catch (error) {
        console.error(`Error fetching user ${participantId}:`, error);
        // Still add the user with limited info
        participantDetails.push({
          id: participantId,
          displayName: 'Unknown User',
          role: 'member',
          joinedAt: new Date()
        });
      }
    }
  } catch (error) {
    console.error('Error getting participant details:', error);
    throw new Error('Failed to get participant details: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
  
  // Validate participant details
  const validParticipantDetails = participantDetails.filter(p => p && typeof p.id === 'string' && p.id.trim() !== '');
  
  if (validParticipantDetails.length === 0) {
    throw new Error('Invalid data: No valid participants found');
  }
  
  // Create conversation data with optional fields
  const conversationData: any = {
    type: data.type || 'direct',
    participants: participantIds,
    participantDetails: validParticipantDetails,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: currentUserId,
    metadata: data.metadata || {},
    unreadCount: 0
  };
  
  // Only add optional fields if they are defined
  if (data.teamId) {
    conversationData.teamId = data.teamId;
  }
  
  if (data.teamName) {
    conversationData.teamName = data.teamName;
  }
  
  if (data.groupType) {
    conversationData.groupType = data.groupType;
  }
  
  console.log('Saving conversation data:', JSON.stringify(conversationData, null, 2));
  
  try {
    // Add to Firestore
    const conversationsCollection = collection(db, 'conversations');
    const conversationRef = await addDoc(conversationsCollection, conversationData);
    console.log('Conversation created with ID:', conversationRef.id);
    
    // If initial message is provided, add it
    if (data.initialMessage) {
      await sendMessageDirect(
        conversationRef.id,
        data.initialMessage,
        currentUserId,
        currentUserName
      );
    }
    
    // Return the conversation object
    return {
      id: conversationRef.id,
      type: data.type || 'direct',
      participants: validParticipantDetails,
      createdAt: new Date(),
      updatedAt: new Date(),
      unreadCount: 0,
      metadata: data.metadata || {},
      ...(data.teamId ? { teamId: data.teamId } : {}),
      ...(data.teamName ? { teamName: data.teamName } : {}),
      ...(data.groupType ? { groupType: data.groupType } : {})
    };
  } catch (error) {
    console.error('Error creating conversation in Firestore:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
}

/**
 * Sends a message directly to Firestore
 * @param conversationId The conversation ID
 * @param content The message content
 * @param senderId The sender's ID
 * @param senderName The sender's name
 * @returns The created message
 */
export async function sendMessageDirect(
  conversationId: string,
  content: string,
  senderId: string,
  senderName: string
): Promise<Message> {
  console.log('Direct message sending with:', {
    conversationId,
    content,
    senderId,
    senderName
  });
  
  try {
    // Try to get the sender's profile picture
    let senderProfilePicture: string | undefined;
    try {
      const userDoc = await getDoc(doc(db, 'users', senderId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        senderProfilePicture = userData.profilePicture;
      }
    } catch (error) {
      console.error('Error fetching sender profile picture:', error);
    }
    
    // Create message data
    const messageData = {
      conversationId,
      content,
      senderId,
      senderName,
      contentType: 'text' as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'sent' as const,
      readBy: [senderId],
      ...(senderProfilePicture ? { senderProfilePicture } : {})
    };
    
    console.log('Saving message data:', JSON.stringify(messageData, null, 2));
    
    // Add to Firestore
    const messagesCollection = collection(db, 'messages');
    console.log('Got messages collection reference');
    
    try {
      const messageRef = await addDoc(messagesCollection, messageData);
      console.log('Message created with ID:', messageRef.id);
      
      // Update conversation with last message
      try {
        const conversationRef = doc(db, 'conversations', conversationId);
        console.log('Got conversation reference for ID:', conversationId);
        
        const lastMessageData = {
          lastMessage: {
            content,
            senderId,
            senderName,
            createdAt: Timestamp.now(),
            ...(senderProfilePicture ? { senderProfilePicture } : {})
          },
          updatedAt: serverTimestamp()
        };
        
        console.log('Updating conversation with last message data:', JSON.stringify(lastMessageData, null, 2));
        
        await updateDoc(conversationRef, lastMessageData);
        console.log('Conversation updated with last message');
      } catch (updateError) {
        console.error('Error updating conversation with last message:', updateError);
        console.error('Error details:', JSON.stringify(updateError, null, 2));
      }
      
      // Return the message object
      return {
        id: messageRef.id,
        conversationId,
        content,
        senderId,
        senderName,
        contentType: 'text',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'sent',
        readBy: [senderId],
        ...(senderProfilePicture ? { senderProfilePicture } : {})
      };
    } catch (addDocError) {
      console.error('Error adding message document:', addDocError);
      console.error('Error details:', JSON.stringify(addDocError, null, 2));
      throw addDocError;
    }
  } catch (error) {
    console.error('Error in sendMessageDirect:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw error;
  }
} 