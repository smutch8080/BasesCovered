import { UserRole } from './auth';

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  recipientId?: string;  // For direct messages
  teamId?: string;       // For team messages
  groupType?: TeamMessageGroup; // For team group messages
  content: string;
  createdAt: Date;
  readBy: string[];
  attachments?: {
    type: 'image' | 'file';
    url: string;
    name: string;
  }[];
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: {
    content: string;
    senderId: string;
    createdAt: Date;
  };
  unreadCount: number;
  updatedAt: Date;
}

export interface TeamChat {
  id: string;
  teamId: string;
  teamName: string;
  groupType?: TeamMessageGroup;
  lastMessage?: {
    content: string;
    senderId: string;
    senderName: string;
    createdAt: Date;
  };
  unreadCount: number;
  updatedAt: Date;
}

export type TeamMessageGroup = 'all' | 'coaches' | 'players' | 'parents';

export interface TeamMessageData {
  teamId: string;
  groupType: TeamMessageGroup;
  content: string;
  attachments?: {
    type: 'image' | 'file';
    url: string;
    name: string;
  }[];
}