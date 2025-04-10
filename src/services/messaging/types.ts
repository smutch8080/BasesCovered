import { TeamMessageGroup } from '../../types/messages';

// Define reaction types
export interface MessageReaction {
  emoji: string;
  userId: string;
  userName: string;
  timestamp: Date;
}

// Message and conversation types
export interface Message {
  id: string;
  conversationId?: string;
  content: string;
  senderId: string;
  senderName: string;
  senderProfilePicture?: string;
  timestamp: Date;
  attachments?: Attachment[];
  reactions?: Reaction[];
  readBy?: string[];
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  replyToId?: string | null;
  isEdited?: boolean;
  updatedAt?: Date;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
  preview?: string;
}

export interface Reaction {
  emoji: string;
  userId: string;
  userName: string;
  timestamp: Date;
}

export interface LastMessage {
  content: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
}

export interface ConversationMetadata {
  groupName?: string;
  groupDescription?: string;
  groupAvatar?: string;
  createdBy?: string;
  createdAt?: Date;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'team';
  participants: Participant[];
  lastMessage?: LastMessage;
  unreadCount?: number;
  createdAt: Date;
  updatedAt?: Date;
  metadata?: ConversationMetadata;
}

export interface Participant {
  id: string;
  displayName: string;
  profilePictureUrl?: string;
  status?: 'online' | 'offline' | 'away';
  lastSeen?: Date;
  role?: string;
  joinedAt?: Date;
}

export interface PaginationOptions {
  limit?: number;
  cursor?: string;
  direction?: 'forward' | 'backward';
}

export interface ConversationCreateData {
  type: 'direct' | 'group' | 'team';
  participantIds: string[];
  metadata?: Record<string, any>;
  initialMessage?: string;
  teamId?: string;
  teamName?: string;
  groupType?: TeamMessageGroup;
}

export interface MessageSendData {
  content: string;
  contentType?: 'text' | 'image' | 'file' | 'audio';
  attachments?: Omit<Attachment, 'id'>[];
  replyTo?: string;
  metadata?: Record<string, any>;
  teamId?: string;
  groupType?: TeamMessageGroup;
}

export type Unsubscribe = () => void;

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

export type UserPresenceStatus = 'online' | 'away' | 'offline';

// Service interface
export interface IMessagingService {
  // Connection management
  initialize(): Promise<void>;
  disconnect(): void;
  getConnectionStatus(): ConnectionStatus;
  
  // Conversation operations
  getConversations(options?: PaginationOptions): Promise<Conversation[]>;
  getConversationById(conversationId: string): Promise<Conversation | null>;
  createConversation(data: ConversationCreateData): Promise<Conversation>;
  updateConversation(conversationId: string, data: Partial<Conversation>): Promise<void>;
  deleteConversation(conversationId: string): Promise<void>;
  
  // Message operations
  getMessages(conversationId: string, options?: PaginationOptions): Promise<Message[]>;
  sendMessage(conversationId: string, data: MessageSendData): Promise<Message>;
  updateMessage(id: string, data: Partial<Message>): Promise<void>;
  deleteMessage(id: string): Promise<void>;
  markAsRead(conversationId: string, messageIds?: string[]): Promise<void>;
  
  // Team chat operations
  getTeamChats(teamId: string): Promise<Conversation[]>;
  sendTeamMessage(teamId: string, groupType: TeamMessageGroup, content: string): Promise<Message>;
  
  // Real-time listeners
  subscribeToConversations(callback: (conversations: Conversation[]) => void): Unsubscribe;
  subscribeToMessages(conversationId: string, callback: (messages: Message[]) => void): Unsubscribe;
  subscribeToTypingIndicators(conversationId: string, callback: (typingUsers: Participant[]) => void): Unsubscribe;
  
  // User presence
  setUserPresence(status: UserPresenceStatus): Promise<void>;
  setTypingStatus(conversationId: string, isTyping: boolean): Promise<void>;
} 