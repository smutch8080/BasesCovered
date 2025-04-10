import { useState, useEffect, useCallback } from 'react';
import { getMessagingService } from '../services/messaging';
import { 
  Conversation, Message, MessageSendData, 
  PaginationOptions, Participant 
} from '../services/messaging/types';
import { TeamMessageGroup } from '../types/messages';

export function useMessaging() {
  const messagingService = getMessagingService();
  const [connectionStatus, setConnectionStatus] = useState(messagingService.getConnectionStatus());
  
  // Initialize the service
  useEffect(() => {
    messagingService.initialize().catch(console.error);
    
    return () => {
      messagingService.disconnect();
    };
  }, [messagingService]);
  
  // Conversations
  const getConversations = useCallback(async (options?: PaginationOptions) => {
    return messagingService.getConversations(options);
  }, [messagingService]);
  
  const getConversationById = useCallback(async (id: string) => {
    return messagingService.getConversationById(id);
  }, [messagingService]);
  
  const createConversation = useCallback(async (data: {
    participantIds: string[];
    initialMessage?: string;
    teamId?: string;
    teamName?: string;
    groupType?: TeamMessageGroup;
  }) => {
    return messagingService.createConversation({
      type: data.teamId ? 'team' : 'direct',
      participantIds: data.participantIds,
      initialMessage: data.initialMessage,
      teamId: data.teamId,
      teamName: data.teamName,
      groupType: data.groupType
    });
  }, [messagingService]);
  
  const deleteConversation = useCallback(async (id: string) => {
    return messagingService.deleteConversation(id);
  }, [messagingService]);
  
  // Messages
  const getMessages = useCallback(async (conversationId: string, options?: PaginationOptions) => {
    return messagingService.getMessages(conversationId, options);
  }, [messagingService]);
  
  const sendMessage = useCallback(async (conversationId: string, content: string, attachments?: any[]) => {
    return messagingService.sendMessage(conversationId, {
      content,
      attachments
    });
  }, [messagingService]);
  
  const sendTeamMessage = useCallback(async (teamId: string, groupType: TeamMessageGroup, content: string) => {
    return messagingService.sendTeamMessage(teamId, groupType, content);
  }, [messagingService]);
  
  const markAsRead = useCallback(async (conversationId: string, messageIds?: string[]) => {
    return messagingService.markAsRead(conversationId, messageIds);
  }, [messagingService]);
  
  const deleteMessage = useCallback(async (id: string) => {
    return messagingService.deleteMessage(id);
  }, [messagingService]);
  
  // Typing indicators
  const setTypingStatus = useCallback(async (conversationId: string, isTyping: boolean) => {
    return messagingService.setTypingStatus(conversationId, isTyping);
  }, [messagingService]);
  
  return {
    connectionStatus,
    getConversations,
    getConversationById,
    createConversation,
    deleteConversation,
    getMessages,
    sendMessage,
    sendTeamMessage,
    markAsRead,
    deleteMessage,
    setTypingStatus
  };
} 