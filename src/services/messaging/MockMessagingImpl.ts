import { nanoid } from 'nanoid';
import { 
  IMessagingService, Message, Conversation, PaginationOptions, 
  ConversationCreateData, MessageSendData, Unsubscribe,
  ConnectionStatus, UserPresenceStatus, Participant
} from './types';
import { TeamMessageGroup } from '../../types/messages';

export class MockMessagingService implements IMessagingService {
  private conversations: Conversation[] = [];
  private messages: Record<string, Message[]> = {};
  private typingUsers: Record<string, Participant[]> = {};
  private connectionStatus: ConnectionStatus = 'connected';
  private currentUser: { uid: string; displayName: string } = { uid: 'current-user', displayName: 'Current User' };
  private listeners: Record<string, Set<Function>> = {
    conversations: new Set(),
    messages: new Set(),
    typing: new Set()
  };

  constructor() {
    // Initialize with some mock data
    this.conversations = [
      {
        id: 'conv1',
        type: 'direct',
        participants: [
          {
            id: 'current-user',
            displayName: 'Current User',
            role: 'member',
            joinedAt: new Date()
          },
          {
            id: 'user1',
            displayName: 'User One',
            role: 'member',
            joinedAt: new Date()
          }
        ],
        lastMessage: {
          content: 'Hello there!',
          senderId: 'user1',
          senderName: 'User One',
          createdAt: new Date()
        },
        unreadCount: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'conv2',
        type: 'team',
        participants: [
          {
            id: 'current-user',
            displayName: 'Current User',
            role: 'member',
            joinedAt: new Date()
          },
          {
            id: 'user2',
            displayName: 'User Two',
            role: 'member',
            joinedAt: new Date()
          },
          {
            id: 'user3',
            displayName: 'User Three',
            role: 'member',
            joinedAt: new Date()
          }
        ],
        lastMessage: {
          content: 'Team announcement',
          senderId: 'user2',
          senderName: 'User Two',
          createdAt: new Date()
        },
        unreadCount: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        teamId: 'team1',
        teamName: 'Team One',
        groupType: 'all'
      }
    ];

    this.messages = {
      conv1: [
        {
          id: 'msg1',
          conversationId: 'conv1',
          senderId: 'user1',
          senderName: 'User One',
          content: 'Hello there!',
          contentType: 'text',
          createdAt: new Date(Date.now() - 3600000),
          status: 'read',
          readBy: ['user1']
        },
        {
          id: 'msg2',
          conversationId: 'conv1',
          senderId: 'current-user',
          senderName: 'Current User',
          content: 'Hi! How are you?',
          contentType: 'text',
          createdAt: new Date(Date.now() - 3000000),
          status: 'read',
          readBy: ['current-user', 'user1']
        },
        {
          id: 'msg3',
          conversationId: 'conv1',
          senderId: 'user1',
          senderName: 'User One',
          content: 'I\'m good, thanks!',
          contentType: 'text',
          createdAt: new Date(Date.now() - 2400000),
          status: 'delivered',
          readBy: ['user1']
        }
      ],
      conv2: [
        {
          id: 'msg4',
          conversationId: 'conv2',
          senderId: 'user2',
          senderName: 'User Two',
          content: 'Team announcement',
          contentType: 'text',
          createdAt: new Date(Date.now() - 1800000),
          status: 'sent',
          readBy: ['user2'],
          teamId: 'team1',
          groupType: 'all'
        }
      ]
    };
  }

  async initialize(): Promise<void> {
    this.connectionStatus = 'connected';
    return Promise.resolve();
  }

  disconnect(): void {
    this.connectionStatus = 'disconnected';
  }

  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  async getConversations(options?: PaginationOptions): Promise<Conversation[]> {
    // Sort by updatedAt descending
    const sorted = [...this.conversations].sort((a, b) => 
      b.updatedAt.getTime() - a.updatedAt.getTime()
    );

    if (options?.limit) {
      return sorted.slice(0, options.limit);
    }

    return sorted;
  }

  async getConversationById(id: string): Promise<Conversation | null> {
    const conversation = this.conversations.find(c => c.id === id);
    return conversation || null;
  }

  async createConversation(data: ConversationCreateData): Promise<Conversation> {
    const newConversation: Conversation = {
      id: nanoid(),
      type: data.type,
      participants: data.participantIds.map(id => ({
        id,
        displayName: id === this.currentUser.uid ? 'Current User' : `User ${id}`,
        role: id === this.currentUser.uid ? 'owner' : 'member',
        joinedAt: new Date()
      })),
      unreadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: data.metadata,
      teamId: data.teamId,
      teamName: data.teamName,
      groupType: data.groupType
    };

    this.conversations.push(newConversation);

    // Initialize messages array for this conversation
    this.messages[newConversation.id] = [];

    // If initial message is provided, send it
    if (data.initialMessage) {
      await this.sendMessage(newConversation.id, {
        content: data.initialMessage
      });
    }

    // Notify listeners
    this.notifyConversationListeners();

    return newConversation;
  }

  async updateConversation(id: string, data: Partial<Conversation>): Promise<void> {
    const index = this.conversations.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Conversation not found');
    }

    this.conversations[index] = {
      ...this.conversations[index],
      ...data,
      updatedAt: new Date()
    };

    // Notify listeners
    this.notifyConversationListeners();
  }

  async deleteConversation(id: string): Promise<void> {
    const index = this.conversations.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Conversation not found');
    }

    this.conversations.splice(index, 1);
    delete this.messages[id];

    // Notify listeners
    this.notifyConversationListeners();
  }

  async getMessages(conversationId: string, options?: PaginationOptions): Promise<Message[]> {
    const messages = this.messages[conversationId] || [];

    // Sort by createdAt ascending
    const sorted = [...messages].sort((a, b) => 
      a.createdAt.getTime() - b.createdAt.getTime()
    );

    if (options?.limit) {
      return sorted.slice(0, options.limit);
    }

    return sorted;
  }

  async sendMessage(conversationId: string, data: MessageSendData): Promise<Message> {
    const conversation = this.conversations.find(c => c.id === conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const newMessage: Message = {
      id: nanoid(),
      conversationId,
      senderId: this.currentUser.uid,
      senderName: this.currentUser.displayName,
      content: data.content,
      contentType: data.contentType || 'text',
      createdAt: new Date(),
      status: 'sent',
      readBy: [this.currentUser.uid],
      attachments: data.attachments ? data.attachments.map(att => ({ ...att, id: nanoid() })) : [],
      replyTo: data.replyTo,
      teamId: data.teamId || conversation.teamId,
      groupType: data.groupType || conversation.groupType
    };

    if (!this.messages[conversationId]) {
      this.messages[conversationId] = [];
    }

    this.messages[conversationId].push(newMessage);

    // Update conversation with last message
    const conversationIndex = this.conversations.findIndex(c => c.id === conversationId);
    this.conversations[conversationIndex] = {
      ...conversation,
      lastMessage: {
        content: data.content,
        senderId: this.currentUser.uid,
        senderName: this.currentUser.displayName,
        createdAt: new Date()
      },
      updatedAt: new Date()
    };

    // Notify listeners
    this.notifyMessageListeners(conversationId);
    this.notifyConversationListeners();

    return newMessage;
  }

  async updateMessage(id: string, data: Partial<Message>): Promise<void> {
    for (const conversationId in this.messages) {
      const index = this.messages[conversationId].findIndex(m => m.id === id);
      if (index !== -1) {
        this.messages[conversationId][index] = {
          ...this.messages[conversationId][index],
          ...data,
          updatedAt: new Date()
        };

        // Notify listeners
        this.notifyMessageListeners(conversationId);
        return;
      }
    }

    throw new Error('Message not found');
  }

  async deleteMessage(id: string): Promise<void> {
    for (const conversationId in this.messages) {
      const index = this.messages[conversationId].findIndex(m => m.id === id);
      if (index !== -1) {
        this.messages[conversationId].splice(index, 1);

        // Notify listeners
        this.notifyMessageListeners(conversationId);
        return;
      }
    }

    throw new Error('Message not found');
  }

  async markAsRead(conversationId: string, messageIds?: string[]): Promise<void> {
    const conversation = this.conversations.find(c => c.id === conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const messages = this.messages[conversationId] || [];

    if (messageIds && messageIds.length > 0) {
      // Mark specific messages as read
      for (const messageId of messageIds) {
        const messageIndex = messages.findIndex(m => m.id === messageId);
        if (messageIndex !== -1) {
          if (!messages[messageIndex].readBy.includes(this.currentUser.uid)) {
            messages[messageIndex].readBy.push(this.currentUser.uid);
          }
        }
      }
    } else {
      // Mark all messages as read
      for (const message of messages) {
        if (!message.readBy.includes(this.currentUser.uid)) {
          message.readBy.push(this.currentUser.uid);
        }
      }
    }

    // Update conversation unread count
    const conversationIndex = this.conversations.findIndex(c => c.id === conversationId);
    this.conversations[conversationIndex] = {
      ...conversation,
      unreadCount: 0
    };

    // Notify listeners
    this.notifyMessageListeners(conversationId);
    this.notifyConversationListeners();
  }

  async getTeamChats(teamId: string): Promise<Conversation[]> {
    return this.conversations.filter(c => c.teamId === teamId);
  }

  async sendTeamMessage(teamId: string, groupType: TeamMessageGroup, content: string): Promise<Message> {
    // Find existing team chat
    const teamChat = this.conversations.find(c => c.teamId === teamId && c.groupType === groupType);

    if (teamChat) {
      return this.sendMessage(teamChat.id, {
        content,
        teamId,
        groupType
      });
    }

    // Create a new team chat
    const newChat = await this.createConversation({
      type: 'team',
      participantIds: [this.currentUser.uid, 'user2', 'user3'], // Mock participants
      teamId,
      teamName: `Team ${teamId}`,
      groupType,
      initialMessage: content
    });

    return {
      id: nanoid(),
      conversationId: newChat.id,
      senderId: this.currentUser.uid,
      senderName: this.currentUser.displayName,
      content,
      contentType: 'text',
      createdAt: new Date(),
      status: 'sent',
      readBy: [this.currentUser.uid],
      teamId,
      groupType
    };
  }

  subscribeToConversations(callback: (conversations: Conversation[]) => void): Unsubscribe {
    const listener = () => {
      callback(this.conversations);
    };

    this.listeners.conversations.add(listener);
    
    // Initial call
    listener();

    return () => {
      this.listeners.conversations.delete(listener);
    };
  }

  subscribeToMessages(conversationId: string, callback: (messages: Message[]) => void): Unsubscribe {
    const listener = () => {
      const messages = this.messages[conversationId] || [];
      callback(messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()));
    };

    if (!this.listeners.messages) {
      this.listeners.messages = new Set();
    }

    this.listeners.messages.add(listener);
    
    // Initial call
    listener();

    return () => {
      this.listeners.messages.delete(listener);
    };
  }

  subscribeToTypingIndicators(conversationId: string, callback: (typingUsers: Participant[]) => void): Unsubscribe {
    const listener = () => {
      callback(this.typingUsers[conversationId] || []);
    };

    if (!this.listeners.typing) {
      this.listeners.typing = new Set();
    }

    this.listeners.typing.add(listener);
    
    // Initial call
    listener();

    return () => {
      this.listeners.typing.delete(listener);
    };
  }

  async setUserPresence(status: UserPresenceStatus): Promise<void> {
    // Mock implementation - no actual state change
    return Promise.resolve();
  }

  async setTypingStatus(conversationId: string, isTyping: boolean): Promise<void> {
    if (!this.typingUsers[conversationId]) {
      this.typingUsers[conversationId] = [];
    }

    if (isTyping) {
      // Add current user to typing users if not already there
      if (!this.typingUsers[conversationId].some(u => u.id === this.currentUser.uid)) {
        this.typingUsers[conversationId].push({
          id: this.currentUser.uid,
          displayName: this.currentUser.displayName,
          role: 'member',
          joinedAt: new Date(),
          isTyping: true
        });
      }

      // Auto-reset typing status after 5 seconds
      setTimeout(() => {
        this.setTypingStatus(conversationId, false);
      }, 5000);
    } else {
      // Remove current user from typing users
      this.typingUsers[conversationId] = this.typingUsers[conversationId].filter(
        u => u.id !== this.currentUser.uid
      );
    }

    // Notify typing listeners
    this.notifyTypingListeners(conversationId);
  }

  private notifyConversationListeners() {
    this.listeners.conversations.forEach(listener => listener());
  }

  private notifyMessageListeners(conversationId: string) {
    this.listeners.messages.forEach(listener => listener());
  }

  private notifyTypingListeners(conversationId: string) {
    this.listeners.typing.forEach(listener => listener());
  }
} 