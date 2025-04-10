import { 
  getFirestore, collection, doc, query, where, orderBy, limit, 
  startAfter, getDocs, getDoc, addDoc, updateDoc, deleteDoc, 
  onSnapshot, serverTimestamp, Timestamp, writeBatch, arrayUnion, increment
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { nanoid } from 'nanoid';
import { 
  IMessagingService, Message, Conversation, PaginationOptions, 
  ConversationCreateData, MessageSendData, Unsubscribe,
  ConnectionStatus, UserPresenceStatus, Participant, Attachment
} from './types';
import { TeamMessageGroup } from '../../types/messages';

export class FirebaseMessagingImpl implements IMessagingService {
  private db;
  private auth;
  private currentUser;
  private activeListeners = new Map<string, Unsubscribe>();
  private connectionStatus: ConnectionStatus = 'disconnected';
  
  // Collection names from Firebase Extension
  private readonly CONVERSATIONS_COLLECTION = 'conversations';
  private readonly MESSAGES_COLLECTION = 'messages';
  private readonly TYPING_COLLECTION = 'typing_indicators';
  private readonly PRESENCE_COLLECTION = 'user_presence';
  private readonly TEAM_CHATS_COLLECTION = 'team_chats';
  
  constructor() {
    this.db = getFirestore();
    this.auth = getAuth();
    this.currentUser = this.auth.currentUser;
    
    // Listen for auth state changes
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
      if (user) {
        this.connectionStatus = 'connected';
      } else {
        this.connectionStatus = 'disconnected';
        this.cleanupListeners();
      }
    });
  }
  
  async initialize(): Promise<void> {
    // Check if user is authenticated
    if (!this.currentUser) {
      console.warn('Authentication required: User must be authenticated to initialize messaging service');
      this.connectionStatus = 'disconnected';
      // Return resolved promise but don't set as connected
      return Promise.resolve();
    }
    
    this.connectionStatus = 'connected';
    return Promise.resolve();
  }
  
  disconnect(): void {
    this.connectionStatus = 'disconnected';
    this.cleanupListeners();
  }
  
  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }
  
  private cleanupListeners(): void {
    this.activeListeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.activeListeners.clear();
  }
  
  // Conversation operations
  async getConversations(options?: PaginationOptions): Promise<Conversation[]> {
    if (!this.currentUser) {
      throw new Error('User must be authenticated to get conversations');
    }
    
    const conversationsRef = collection(this.db, this.CONVERSATIONS_COLLECTION);
    let q = query(
      conversationsRef,
      where('participants', 'array-contains', this.currentUser.uid),
      orderBy('updatedAt', 'desc')
    );
    
    if (options?.limit) {
      q = query(q, limit(options.limit));
    }
    
    if (options?.cursor) {
      const cursorDoc = await getDoc(doc(this.db, this.CONVERSATIONS_COLLECTION, options.cursor));
      if (cursorDoc.exists()) {
        q = query(q, startAfter(cursorDoc));
      }
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => this.convertConversation(doc.id, doc.data()));
  }
  
  async getConversationById(id: string): Promise<Conversation | null> {
    if (!this.currentUser) {
      throw new Error('User must be authenticated to get conversation');
    }
    
    const conversationDoc = await getDoc(doc(this.db, this.CONVERSATIONS_COLLECTION, id));
    if (!conversationDoc.exists()) {
      return null;
    }
    
    const data = conversationDoc.data();
    // Verify user is a participant
    if (!data.participants.includes(this.currentUser.uid)) {
      throw new Error('User is not a participant in this conversation');
    }
    
    return this.convertConversation(conversationDoc.id, data);
  }
  
  async createConversation(data: ConversationCreateData): Promise<Conversation> {
    if (!this.currentUser) {
      throw new Error('User must be authenticated to create conversation');
    }
    
    // Ensure current user is included in participants
    if (!data.participantIds.includes(this.currentUser.uid)) {
      data.participantIds.push(this.currentUser.uid);
    }
    
    // Get participant details
    const participantDetails: Participant[] = await Promise.all(
      data.participantIds.map(async (id) => {
        if (id === this.currentUser?.uid) {
          // Get current user's profile picture from Firestore
          try {
            const userDoc = await getDoc(doc(this.db, 'users', this.currentUser.uid));
            const userData = userDoc.data();
            return {
              id,
              displayName: this.currentUser.displayName || 'You',
              role: 'owner',
              joinedAt: new Date(),
              profilePicture: userData?.profilePicture
            };
          } catch (error) {
            console.error('Error fetching current user data:', error);
            return {
              id,
              displayName: this.currentUser.displayName || 'You',
              role: 'owner',
              joinedAt: new Date()
            };
          }
        }
        
        try {
          const userDoc = await getDoc(doc(this.db, 'users', id));
          const userData = userDoc.exists() ? userDoc.data() : null;
          return {
            id,
            displayName: userData?.displayName || 'Unknown User',
            role: 'member',
            joinedAt: new Date(),
            profilePicture: userData?.profilePicture
          };
        } catch (error) {
          console.error(`Error fetching user ${id}:`, error);
          return {
            id,
            displayName: 'Unknown User',
            role: 'member',
            joinedAt: new Date()
          };
        }
      })
    );
    
    const conversationData = {
      type: data.type,
      participants: data.participantIds,
      participantDetails,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: this.currentUser.uid,
      metadata: data.metadata || {},
      unreadCount: 0,
      ...(data.teamId ? { teamId: data.teamId } : {}),
      ...(data.teamName ? { teamName: data.teamName } : {}),
      ...(data.groupType ? { groupType: data.groupType } : {})
    };
    
    const conversationRef = await addDoc(collection(this.db, this.CONVERSATIONS_COLLECTION), conversationData);
    
    // If initial message is provided, send it
    if (data.initialMessage) {
      await this.sendMessage(conversationRef.id, {
        content: data.initialMessage
      });
    }
    
    return {
      id: conversationRef.id,
      type: data.type,
      participants: participantDetails,
      createdAt: new Date(),
      updatedAt: new Date(),
      unreadCount: 0,
      metadata: data.metadata || {},
      ...(data.teamId ? { teamId: data.teamId } : {}),
      ...(data.teamName ? { teamName: data.teamName } : {}),
      ...(data.groupType ? { groupType: data.groupType } : {})
    };
  }
  
  async updateConversation(id: string, data: Partial<Conversation>): Promise<void> {
    if (!this.currentUser) {
      throw new Error('User must be authenticated to update conversation');
    }
    
    const conversationRef = doc(this.db, this.CONVERSATIONS_COLLECTION, id);
    const conversationDoc = await getDoc(conversationRef);
    
    if (!conversationDoc.exists()) {
      throw new Error('Conversation not found');
    }
    
    const conversationData = conversationDoc.data();
    if (!conversationData.participants.includes(this.currentUser.uid)) {
      throw new Error('User is not a participant in this conversation');
    }
    
    const updateData: any = {
      updatedAt: serverTimestamp()
    };
    
    if (data.metadata) {
      updateData.metadata = data.metadata;
    }
    
    await updateDoc(conversationRef, updateData);
  }
  
  async deleteConversation(id: string): Promise<void> {
    if (!this.currentUser) {
      throw new Error('User must be authenticated to delete conversation');
    }
    
    const conversationRef = doc(this.db, this.CONVERSATIONS_COLLECTION, id);
    const conversationDoc = await getDoc(conversationRef);
    
    if (!conversationDoc.exists()) {
      throw new Error('Conversation not found');
    }
    
    const conversationData = conversationDoc.data();
    if (!conversationData.participants.includes(this.currentUser.uid)) {
      throw new Error('User is not a participant in this conversation');
    }
    
    // Delete conversation and all its messages
    const batch = writeBatch(this.db);
    
    // Delete conversation
    batch.delete(conversationRef);
    
    // Delete messages (note: in a real app, you might want to do this in chunks)
    const messagesQuery = query(
      collection(this.db, this.MESSAGES_COLLECTION),
      where('conversationId', '==', id)
    );
    
    const messagesSnapshot = await getDocs(messagesQuery);
    messagesSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  }
  
  // Message operations
  async getMessages(conversationId: string, options?: PaginationOptions): Promise<Message[]> {
    if (!this.currentUser) {
      throw new Error('User must be authenticated to get messages');
    }
    
    // Verify user is a participant in the conversation
    const conversationDoc = await getDoc(doc(this.db, this.CONVERSATIONS_COLLECTION, conversationId));
    if (!conversationDoc.exists()) {
      throw new Error('Conversation not found');
    }
    
    const conversationData = conversationDoc.data();
    if (!conversationData.participants.includes(this.currentUser.uid)) {
      throw new Error('User is not a participant in this conversation');
    }
    
    const messagesRef = collection(this.db, this.MESSAGES_COLLECTION);
    let q = query(
      messagesRef,
      where('conversationId', '==', conversationId),
      orderBy('createdAt', options?.direction === 'backward' ? 'desc' : 'asc')
    );
    
    if (options?.limit) {
      q = query(q, limit(options.limit));
    }
    
    if (options?.cursor) {
      const cursorDoc = await getDoc(doc(this.db, this.MESSAGES_COLLECTION, options.cursor));
      if (cursorDoc.exists()) {
        q = query(q, startAfter(cursorDoc));
      }
    }
    
    const snapshot = await getDocs(q);
    const messages = snapshot.docs.map(doc => this.convertMessage(doc.id, doc.data()));
    
    // If we queried in descending order, reverse the results
    return options?.direction === 'backward' ? messages.reverse() : messages;
  }
  
  async sendMessage(conversationId: string, data: MessageSendData): Promise<Message> {
    if (!this.currentUser) {
      throw new Error('User must be authenticated to send message');
    }
    
    try {
      console.log('FirebaseMessagingImpl.sendMessage called with:', {
        conversationId,
        data
      });
      
      // Verify conversation exists
      const conversationRef = doc(this.db, this.CONVERSATIONS_COLLECTION, conversationId);
      const conversationDoc = await getDoc(conversationRef);
      
      if (!conversationDoc.exists()) {
        throw new Error(`Conversation with ID ${conversationId} not found`);
      }
      
      const conversationData = conversationDoc.data();
      console.log('Found conversation:', conversationData);
      
      // Verify user is a participant
      if (!conversationData.participants.includes(this.currentUser.uid)) {
        throw new Error('User is not a participant in this conversation');
      }
      
      // Get sender's profile picture
      let senderProfilePicture: string | undefined;
      try {
        const userDoc = await getDoc(doc(this.db, 'users', this.currentUser.uid));
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
        content: data.content,
        senderId: this.currentUser.uid,
        senderName: this.currentUser.displayName || 'Unknown User',
        senderProfilePicture,
        timestamp: serverTimestamp(),
        status: 'sent',
        readBy: [this.currentUser.uid],
        ...(data.attachments && data.attachments.length > 0 ? { 
          attachments: data.attachments.map(att => ({ ...att, id: nanoid() })) 
        } : {}),
        ...(data.replyTo ? { replyToId: data.replyTo } : {})
      };
      
      console.log('Creating message with data:', JSON.stringify(messageData, null, 2));
      
      // Add message to Firestore
      const messageRef = await addDoc(collection(this.db, this.MESSAGES_COLLECTION), messageData);
      console.log('Message created with ID:', messageRef.id);
      
      // Update conversation with last message
      const lastMessageData = {
        lastMessage: {
          content: data.content,
          senderId: this.currentUser.uid,
          senderName: this.currentUser.displayName || 'Unknown User',
          timestamp: Timestamp.now(),
          ...(senderProfilePicture ? { senderProfilePicture } : {})
        },
        updatedAt: serverTimestamp()
      };
      
      console.log('Updating conversation with last message data:', JSON.stringify(lastMessageData, null, 2));
      
      await updateDoc(conversationRef, lastMessageData);
      console.log('Conversation updated with last message');
      
      // Update unread count for other participants
      const batch = writeBatch(this.db);
      
      // Get all participant IDs except the sender
      const otherParticipantIds = conversationData.participants.filter(
        (id: string) => id !== this.currentUser?.uid
      );
      
      // Update unread counts for each participant
      for (const participantId of otherParticipantIds) {
        const unreadCountRef = doc(
          this.db, 
          'unread_counts', 
          `${conversationId}_${participantId}`
        );
        
        try {
          const unreadCountDoc = await getDoc(unreadCountRef);
          
          if (unreadCountDoc.exists()) {
            batch.update(unreadCountRef, {
              count: increment(1),
              updatedAt: serverTimestamp()
            });
          } else {
            batch.set(unreadCountRef, {
              conversationId,
              userId: participantId,
              count: 1,
              updatedAt: serverTimestamp()
            });
          }
        } catch (error) {
          console.error(`Error updating unread count for participant ${participantId}:`, error);
          // Continue with other participants
        }
      }
      
      try {
        await batch.commit();
        console.log('Unread counts updated for all participants');
      } catch (error) {
        console.error('Error updating unread counts:', error);
        // Continue anyway - the message was sent successfully
      }
      
      // Return the message object
      return {
        id: messageRef.id,
        conversationId,
        content: data.content,
        senderId: this.currentUser.uid,
        senderName: this.currentUser.displayName || 'Unknown User',
        senderProfilePicture,
        timestamp: new Date(),
        status: 'sent',
        readBy: [this.currentUser.uid],
        ...(data.attachments && data.attachments.length > 0 ? { 
          attachments: data.attachments.map(att => ({ ...att, id: nanoid() })) 
        } : {}),
        ...(data.replyTo ? { replyToId: data.replyTo } : {})
      };
    } catch (error) {
      console.error('Error in FirebaseMessagingImpl.sendMessage:', error);
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
  
  async updateMessage(id: string, data: Partial<Message>): Promise<void> {
    if (!this.currentUser) {
      throw new Error('User must be authenticated to update message');
    }
    
    const messageRef = doc(this.db, this.MESSAGES_COLLECTION, id);
    const messageDoc = await getDoc(messageRef);
    
    if (!messageDoc.exists()) {
      throw new Error('Message not found');
    }
    
    const messageData = messageDoc.data();
    if (messageData.senderId !== this.currentUser.uid) {
      throw new Error('User can only update their own messages');
    }
    
    const updateData: any = {};
    
    if (data.content) {
      updateData.content = data.content;
      updateData.updatedAt = serverTimestamp();
    }
    
    if (data.status) {
      updateData.status = data.status;
    }
    
    await updateDoc(messageRef, updateData);
  }
  
  async deleteMessage(id: string): Promise<void> {
    if (!this.currentUser) {
      throw new Error('User must be authenticated to delete message');
    }
    
    const messageRef = doc(this.db, this.MESSAGES_COLLECTION, id);
    const messageDoc = await getDoc(messageRef);
    
    if (!messageDoc.exists()) {
      throw new Error('Message not found');
    }
    
    const messageData = messageDoc.data();
    if (messageData.senderId !== this.currentUser.uid) {
      throw new Error('User can only delete their own messages');
    }
    
    await deleteDoc(messageRef);
  }
  
  async markAsRead(conversationId: string, messageIds?: string[]): Promise<void> {
    if (!this.currentUser) {
      throw new Error('User must be authenticated to mark messages as read');
    }
    
    const batch = writeBatch(this.db);
    
    // Update user's unread count for this conversation
    const userConversationRef = doc(
      this.db, 
      `${this.CONVERSATIONS_COLLECTION}_users`, 
      `${conversationId}_${this.currentUser.uid}`
    );
    
    batch.update(userConversationRef, {
      unreadCount: 0
    });
    
    // If specific message IDs are provided, mark only those as read
    if (messageIds && messageIds.length > 0) {
      for (const messageId of messageIds) {
        const messageRef = doc(this.db, this.MESSAGES_COLLECTION, messageId);
        batch.update(messageRef, {
          readBy: arrayUnion(this.currentUser.uid)
        });
      }
    } else {
      // Otherwise, mark all unread messages in the conversation as read
      const messagesQuery = query(
        collection(this.db, this.MESSAGES_COLLECTION),
        where('conversationId', '==', conversationId),
        where('readBy', 'array-contains', this.currentUser.uid)
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      messagesSnapshot.forEach(doc => {
        const messageData = doc.data();
        if (!messageData.readBy.includes(this.currentUser?.uid)) {
          batch.update(doc.ref, {
            readBy: [...messageData.readBy, this.currentUser?.uid]
          });
        }
      });
    }
    
    await batch.commit();
  }
  
  // Team chat operations
  async getTeamChats(teamId: string): Promise<Conversation[]> {
    if (!this.currentUser) {
      throw new Error('User must be authenticated to get team chats');
    }
    
    const teamChatsRef = collection(this.db, this.TEAM_CHATS_COLLECTION);
    const q = query(
      teamChatsRef,
      where('teamId', '==', teamId),
      orderBy('updatedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => this.convertConversation(doc.id, doc.data()));
  }
  
  async sendTeamMessage(teamId: string, groupType: TeamMessageGroup, content: string): Promise<Message> {
    if (!this.currentUser) {
      throw new Error('User must be authenticated to send team message');
    }
    
    // Find or create the team chat conversation
    const teamChatsRef = collection(this.db, this.TEAM_CHATS_COLLECTION);
    const q = query(
      teamChatsRef,
      where('teamId', '==', teamId),
      where('groupType', '==', groupType)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Create a new team chat
      const teamDoc = await getDoc(doc(this.db, 'teams', teamId));
      if (!teamDoc.exists()) {
        throw new Error('Team not found');
      }
      
      const teamData = teamDoc.data();
      
      // Get all team members based on the group type
      let participantIds: string[] = [];
      
      switch (groupType) {
        case 'coaches':
          participantIds = teamData.coaches || [];
          break;
        case 'players':
          participantIds = teamData.players || [];
          break;
        case 'parents':
          participantIds = teamData.parents || [];
          break;
        case 'all':
        default:
          participantIds = [
            ...(teamData.coaches || []),
            ...(teamData.players || []),
            ...(teamData.parents || [])
          ];
          break;
      }
      
      // Ensure current user is included
      if (!participantIds.includes(this.currentUser.uid)) {
        participantIds.push(this.currentUser.uid);
      }
      
      // Create the team chat
      const newChat = await this.createConversation({
        type: 'team',
        participantIds,
        teamId,
        teamName: teamData.name,
        groupType,
        initialMessage: content
      });
      
      // Create a message object to return
      const messageId = nanoid();
      return {
        id: messageId,
        conversationId: newChat.id,
        content,
        senderId: this.currentUser.uid,
        senderName: this.currentUser.displayName || 'Unknown User',
        timestamp: new Date(),
        readBy: [this.currentUser.uid],
        status: 'sent'
      };
    } else {
      // Use existing team chat
      const chatDoc = snapshot.docs[0];
      const conversationId = chatDoc.id;
      
      // Use the sendMessage method to send to the existing conversation
      return await this.sendMessage(conversationId, {
        content
      });
    }
  }
  
  // Real-time listeners
  subscribeToConversations(callback: (conversations: Conversation[]) => void): Unsubscribe {
    if (!this.currentUser) {
      throw new Error('User must be authenticated to subscribe to conversations');
    }
    
    const conversationsRef = collection(this.db, this.CONVERSATIONS_COLLECTION);
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', this.currentUser.uid),
      orderBy('updatedAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const conversations = snapshot.docs.map(doc => 
        this.convertConversation(doc.id, doc.data())
      );
      callback(conversations);
    });
    
    const listenerId = `conversations_${this.currentUser.uid}`;
    this.activeListeners.set(listenerId, unsubscribe);
    
    return () => {
      unsubscribe();
      this.activeListeners.delete(listenerId);
    };
  }
  
  subscribeToMessages(conversationId: string, callback: (messages: Message[]) => void): Unsubscribe {
    if (!this.currentUser) {
      throw new Error('User must be authenticated to subscribe to messages');
    }
    
    const messagesRef = collection(this.db, this.MESSAGES_COLLECTION);
    const q = query(
      messagesRef,
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => 
        this.convertMessage(doc.id, doc.data())
      );
      callback(messages);
    });
    
    const listenerId = `messages_${conversationId}`;
    this.activeListeners.set(listenerId, unsubscribe);
    
    return () => {
      unsubscribe();
      this.activeListeners.delete(listenerId);
    };
  }
  
  subscribeToTypingIndicators(conversationId: string, callback: (typingUsers: Participant[]) => void): Unsubscribe {
    if (!this.currentUser) {
      throw new Error('User must be authenticated to subscribe to typing indicators');
    }
    
    const typingRef = collection(this.db, this.TYPING_COLLECTION);
    const q = query(
      typingRef,
      where('conversationId', '==', conversationId),
      where('isTyping', '==', true)
    );
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const typingUserIds = snapshot.docs
        .map(doc => doc.data().userId)
        .filter(id => id !== this.currentUser?.uid);
      
      // Get user details for typing users
      const typingUsers: Participant[] = [];
      
      for (const userId of typingUserIds) {
        const userDoc = await getDoc(doc(this.db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          typingUsers.push({
            id: userId,
            displayName: userData.displayName || 'Unknown User',
            role: 'member',
            joinedAt: new Date(),
            isTyping: true
          });
        }
      }
      
      callback(typingUsers);
    });
    
    const listenerId = `typing_${conversationId}`;
    this.activeListeners.set(listenerId, unsubscribe);
    
    return () => {
      unsubscribe();
      this.activeListeners.delete(listenerId);
    };
  }
  
  // User presence
  async setUserPresence(status: UserPresenceStatus): Promise<void> {
    if (!this.currentUser) {
      throw new Error('User must be authenticated to set presence');
    }
    
    const presenceRef = doc(this.db, this.PRESENCE_COLLECTION, this.currentUser.uid);
    
    await updateDoc(presenceRef, {
      status,
      lastSeen: serverTimestamp()
    });
  }
  
  async setTypingStatus(conversationId: string, isTyping: boolean): Promise<void> {
    if (!this.currentUser) {
      throw new Error('User must be authenticated to set typing status');
    }
    
    const typingRef = doc(
      this.db, 
      this.TYPING_COLLECTION, 
      `${conversationId}_${this.currentUser.uid}`
    );
    
    if (isTyping) {
      await updateDoc(typingRef, {
        conversationId,
        userId: this.currentUser.uid,
        isTyping: true,
        timestamp: serverTimestamp()
      });
      
      // Auto-reset typing status after 5 seconds of inactivity
      setTimeout(async () => {
        await updateDoc(typingRef, {
          isTyping: false,
          timestamp: serverTimestamp()
        });
      }, 5000);
    } else {
      await updateDoc(typingRef, {
        isTyping: false,
        timestamp: serverTimestamp()
      });
    }
  }
  
  // Helper methods for data conversion
  private convertConversation(id: string, data: any): Conversation {
    return {
      id,
      type: data.type || 'direct',
      participants: data.participantDetails || [],
      lastMessage: data.lastMessage ? {
        content: data.lastMessage.content,
        senderId: data.lastMessage.senderId,
        senderName: data.lastMessage.senderName,
        timestamp: (data.lastMessage.timestamp || data.lastMessage.createdAt)?.toDate() || new Date(),
        ...(data.lastMessage.senderProfilePicture ? { senderProfilePicture: data.lastMessage.senderProfilePicture } : {})
      } : undefined,
      unreadCount: data.unreadCount || 0,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      metadata: data.metadata || {},
      ...(data.teamId ? { teamId: data.teamId } : {}),
      ...(data.teamName ? { teamName: data.teamName } : {}),
      ...(data.groupType ? { groupType: data.groupType } : {})
    };
  }
  
  private convertMessage(id: string, data: any): Message {
    return {
      id,
      conversationId: data.conversationId,
      senderId: data.senderId,
      senderName: data.senderName,
      content: data.content,
      timestamp: data.timestamp?.toDate() || data.createdAt?.toDate() || new Date(),
      status: data.status || 'sent',
      readBy: data.readBy || [],
      attachments: data.attachments || [],
      replyToId: data.replyTo || data.replyToId,
      senderProfilePicture: data.senderProfilePicture,
      ...(data.updatedAt ? { updatedAt: data.updatedAt.toDate() } : {}),
      ...(data.isEdited !== undefined ? { isEdited: data.isEdited } : {})
    };
  }
} 