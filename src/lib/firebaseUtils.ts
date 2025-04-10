import { db } from './firebase';
import { collection, getDocs, limit, query, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

/**
 * Checks if the Firebase connection is working properly
 * @returns A promise that resolves to a boolean indicating if the connection is working
 */
export async function checkFirebaseConnection(): Promise<boolean> {
  try {
    console.log('Checking Firebase connection...');
    
    // First, try a simple check with navigator.onLine
    if (!navigator.onLine) {
      console.log('Browser reports offline status');
      return false;
    }
    
    // Try multiple approaches to verify connection
    try {
      // Approach 1: Try to fetch a small amount of data from Firestore
      const testQuery = query(collection(db, 'users'), limit(1));
      const snapshot = await getDocs(testQuery);
      console.log('Firebase connection check successful via users collection');
      return true;
    } catch (error1) {
      console.warn('First connection check failed:', error1);
      
      try {
        // Approach 2: Try to fetch a document that should always exist
        const docRef = doc(db, 'system', 'status');
        await getDoc(docRef);
        console.log('Firebase connection check successful via system document');
        return true;
      } catch (error2) {
        console.warn('Second connection check failed:', error2);
        
        try {
          // Approach 3: Try to fetch from conversations collection
          const convoQuery = query(collection(db, 'conversations'), limit(1));
          await getDocs(convoQuery);
          console.log('Firebase connection check successful via conversations collection');
          return true;
        } catch (error3) {
          console.error('All connection checks failed');
          return false;
        }
      }
    }
  } catch (error) {
    console.error('Firebase connection check failed:', error);
    return false;
  }
}

/**
 * Checks if the current user has permission to access a conversation
 * @param conversationId The ID of the conversation to check
 * @returns A promise that resolves if the user has permission and rejects with an error if not
 */
export async function checkConversationPermission(conversationId: string): Promise<void> {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.error('Permission check failed: No authenticated user');
      throw new Error('You must be logged in to access conversations');
    }
    
    console.log('Checking permission for user:', currentUser.uid);
    
    // Try to get the conversation document
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationDoc = await getDoc(conversationRef);
    
    if (!conversationDoc.exists()) {
      console.error(`Permission check failed: Conversation ${conversationId} not found`);
      throw new Error('Conversation not found');
    }
    
    const conversationData = conversationDoc.data();
    const participants = conversationData.participants || [];
    
    console.log('Conversation data:', {
      id: conversationId,
      type: conversationData.type,
      participantsCount: participants.length,
      hasParticipantsArray: Array.isArray(participants),
      hasParticipantIds: Array.isArray(conversationData.participantIds)
    });
    
    // Log all participants for debugging
    if (Array.isArray(participants)) {
      console.log('All participants:');
      participants.forEach((p, index) => {
        console.log(`Participant ${index}:`, typeof p === 'object' ? JSON.stringify(p) : p);
      });
    }
    
    // Log the participantIds array if it exists
    if (Array.isArray(conversationData.participantIds)) {
      console.log('ParticipantIds array:', conversationData.participantIds);
    }
    
    console.log('Current user ID:', currentUser.uid);
    
    // Check if the current user is a participant - try different ways to match
    // First check if the participant is an object with an id property
    let isParticipant = participants.some((p: any) => {
      const match = (typeof p === 'object' && p !== null && p.id === currentUser.uid);
      console.log(`Checking object participant with uid: ${JSON.stringify(p)}, match: ${match}`);
      return match;
    });
    
    // If not found, check if the participant is a string (just the ID)
    if (!isParticipant) {
      isParticipant = participants.some((p: any) => {
        const match = (typeof p === 'string' && p === currentUser.uid);
        console.log(`Checking string participant with uid: ${p}, match: ${match}`);
        return match;
      });
    }
    
    // If still not found, check if there's a participantIds array
    if (!isParticipant && Array.isArray(conversationData.participantIds)) {
      isParticipant = conversationData.participantIds.includes(currentUser.uid);
      console.log(`Checking participantIds array with uid, match: ${isParticipant}`);
    }
    
    // If still not found, try with email if available
    if (!isParticipant && currentUser.email) {
      isParticipant = participants.some((p: any) => {
        const match = (
          (typeof p === 'object' && p !== null && p.email === currentUser.email) ||
          (typeof p === 'object' && p !== null && p.emailAddress === currentUser.email)
        );
        console.log(`Checking participant with email: ${JSON.stringify(p)}, match: ${match}`);
        return match;
      });
      console.log(`Checking participants with email, match: ${isParticipant}`);
    }
    
    if (!isParticipant) {
      console.error(`Permission check failed: User ${currentUser.uid} is not a participant in conversation ${conversationId}`);
      throw new Error('You are not a participant in this conversation');
    }
    
    console.log(`Permission check passed: User ${currentUser.uid} is a participant in conversation ${conversationId}`);
    return;
  } catch (error) {
    console.error('Error checking conversation permission:', error);
    throw new Error('Failed to check permission: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
} 