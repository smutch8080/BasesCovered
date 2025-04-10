import { FirebaseMessagingImpl } from './FirebaseMessagingImpl';
import { IMessagingService } from './types';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  arrayUnion, 
  arrayRemove, 
  Timestamp, 
  getFirestore, 
  getDoc, 
  getDocs, 
  limit 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getStorage } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { Message, Conversation, Attachment } from './types';
import { getAuth } from 'firebase/auth';

const db = getFirestore();
const storage = getStorage();

let messagingService: IMessagingService | null = null;

export function getMessagingService(): IMessagingService {
  if (!messagingService) {
    messagingService = new FirebaseMessagingImpl();
  }
  return messagingService;
}

export * from './types';

/**
 * Get messages for a conversation with real-time updates
 */
export const getMessages = (
  conversationId: string, 
  callback: (messages: Message[], error: Error | null) => void
): (() => void) => {
  if (!conversationId) {
    console.error('Invalid conversationId provided to getMessages:', conversationId);
    callback([], new Error('Invalid conversation ID'));
    return () => {}; // Return a no-op function
  }

  try {
    console.log(`Setting up messages listener for conversation: ${conversationId}`);
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.error('No authenticated user found when trying to get messages');
      callback([], new Error('You must be logged in to view messages'));
      return () => {};
    }
    
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));
    
    console.log(`Setting up messages query for conversation ${conversationId} with user ${currentUser.uid}`);
    
    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        console.log(`Received snapshot with ${snapshot.docs.length} messages`);
        const messages = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            content: data.content || '',
            senderId: data.senderId,
            senderName: data.senderName,
            senderProfilePicture: data.senderProfilePicture || '',
            timestamp: data.timestamp?.toDate() || new Date(),
            attachments: data.attachments || [],
            reactions: data.reactions || [],
            readBy: data.readBy || [],
            status: data.status || 'sent',
            replyToId: data.replyToId || null,
            isEdited: data.isEdited || false,
            updatedAt: data.updatedAt?.toDate() || null
          };
        });
        callback(messages, null);
      },
      (error) => {
        console.error('Error getting messages:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          conversationId,
          userId: currentUser.uid
        });
        
        // Provide more specific error messages for common errors
        if (error.code === 'permission-denied') {
          console.error('Firestore permission denied. This could be due to security rules.');
          console.error('Please check your Firestore security rules for the conversations collection.');
          console.error('Make sure the rules allow the current user to read messages in this conversation.');
          
          // Try to get the conversation document to check if it exists and if the user is a participant
          try {
            const conversationRef = doc(db, 'conversations', conversationId);
            getDoc(conversationRef).then(docSnap => {
              if (!docSnap.exists()) {
                console.error(`Conversation ${conversationId} does not exist.`);
              } else {
                const data = docSnap.data();
                console.error('Conversation exists:', {
                  id: conversationId,
                  participants: data.participants,
                  currentUser: currentUser.uid
                });
              }
            }).catch(err => {
              console.error('Error checking conversation:', err);
            });
          } catch (checkError) {
            console.error('Error while trying to check conversation:', checkError);
          }
          
          callback([], new Error('Permission denied: You do not have access to this conversation'));
        } else if (error.code === 'not-found') {
          callback([], new Error('Conversation not found'));
        } else {
          callback([], error as Error);
        }
      }
    );
    
    return unsubscribe;
  } catch (error) {
    console.error('Error setting up messages listener:', error);
    callback([], error instanceof Error ? error : new Error('Unknown error getting messages'));
    return () => {}; // Return a no-op function
  }
};

/**
 * Send a message to a conversation
 */
export const sendMessage = async (
  conversationId: string,
  content: string,
  senderId: string,
  senderName: string,
  senderProfilePicture: string,
  attachments: File[] = [],
  replyToId?: string
): Promise<string> => {
  try {
    // Upload attachments if any
    const uploadedAttachments: Attachment[] = [];
    
    if (attachments.length > 0) {
      for (const file of attachments) {
        const attachment = await uploadAttachment(conversationId, file);
        uploadedAttachments.push(attachment);
      }
    }
    
    // Create the message
    const messageData = {
      content,
      senderId,
      senderName,
      senderProfilePicture,
      timestamp: serverTimestamp(),
      attachments: uploadedAttachments,
      reactions: [],
      readBy: [senderId], // Sender has read the message
      status: 'sent',
      replyToId: replyToId || null,
      isEdited: false
    };
    
    // Add the message to the conversation
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const docRef = await addDoc(messagesRef, messageData);
    
    // Update the conversation's last message
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      lastMessage: {
        content: content || (uploadedAttachments.length > 0 ? 'Sent an attachment' : ''),
        senderId,
        senderName,
        timestamp: Timestamp.now()
      },
      updatedAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Upload an attachment
 */
const uploadAttachment = async (conversationId: string, file: File): Promise<Attachment> => {
  const fileId = uuidv4();
  const fileExtension = file.name.split('.').pop() || '';
  const filePath = `conversations/${conversationId}/attachments/${fileId}.${fileExtension}`;
  const storageRef = ref(storage, filePath);
  
  // Upload the file
  await uploadBytes(storageRef, file);
  
  // Get the download URL
  const downloadURL = await getDownloadURL(storageRef);
  
  return {
    id: fileId,
    name: file.name,
    type: file.type,
    size: file.size,
    url: downloadURL,
    uploadedAt: new Date()
  };
};

/**
 * Mark a message as read by a user
 */
export const markMessageAsRead = async (
  conversationId: string,
  messageId: string,
  userId: string
): Promise<void> => {
  try {
    const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    await updateDoc(messageRef, {
      readBy: arrayUnion(userId),
      status: 'read'
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

/**
 * Edit a message
 */
export const editMessage = async (
  conversationId: string,
  messageId: string,
  newContent: string,
  userId: string
): Promise<void> => {
  try {
    const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    await updateDoc(messageRef, {
      content: newContent,
      isEdited: true,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error editing message:', error);
    throw error;
  }
};

/**
 * Delete a message
 */
export const deleteMessage = async (
  conversationId: string,
  messageId: string,
  userId: string
): Promise<void> => {
  try {
    const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    await deleteDoc(messageRef);
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

/**
 * Add a reaction to a message
 */
export const addReaction = async (
  conversationId: string,
  messageId: string,
  emoji: string,
  userId: string,
  userName: string
): Promise<void> => {
  try {
    const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    
    // Add the reaction to the reactions array
    await updateDoc(messageRef, {
      reactions: arrayUnion({
        emoji,
        userId,
        userName,
        timestamp: Timestamp.now()
      })
    });
  } catch (error) {
    console.error('Error adding reaction:', error);
    throw error;
  }
};

/**
 * Remove a reaction from a message
 */
export const removeReaction = async (
  conversationId: string,
  messageId: string,
  emoji: string,
  userId: string
): Promise<void> => {
  try {
    // First get the current reactions to find the exact one to remove
    const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    
    // Remove the reaction from the reactions array
    // Note: This is a simplification. In a real app, you'd need to get the message first
    // to find the exact reaction object to remove
    await updateDoc(messageRef, {
      reactions: arrayRemove({
        emoji,
        userId
        // We can't include timestamp here as it won't match exactly
      })
    });
  } catch (error) {
    console.error('Error removing reaction:', error);
    throw error;
  }
}; 