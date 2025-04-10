export type NotificationDeliveryMethod = 'email' | 'sms' | 'both' | 'push' | 'all';

export interface NotificationPayload {
  to: string;
  subject?: string;
  text: string;
  html?: string;
  phoneNumber?: string;
  // Push notification specific fields
  title?: string;
  body?: string;
  icon?: string;
  url?: string;
  data?: Record<string, string>;
  tag?: string;
}

export interface NotificationPreferences {
  userId: string;
  email: boolean;
  sms: boolean;
  push: boolean;
  types: {
    practiceReminders: boolean;
    gameReminders: boolean;
    gameStartAlerts: boolean;
    gameEndAlerts: boolean;
    teamUpdates: boolean;
    newMessages: boolean;
    homeworkReminders: boolean;
    progressReports: boolean;
  };
}

// Notification categories for organization
export enum NotificationCategory {
  PRACTICE = 'practice',
  GAME = 'game',
  MESSAGE = 'message',
  TEAM = 'team',
  HOMEWORK = 'homework', 
  SYSTEM = 'system'
}

// Specific notification types within each category
export enum NotificationEvent {
  // Practice notifications
  PRACTICE_REMINDER = 'practice_reminder',
  PRACTICE_CANCELED = 'practice_canceled',
  PRACTICE_RESCHEDULED = 'practice_rescheduled',
  PRACTICE_LOCATION_CHANGED = 'practice_location_changed',
  
  // Game notifications
  GAME_REMINDER = 'game_reminder',
  GAME_START = 'game_start',
  GAME_END = 'game_end',
  GAME_CANCELED = 'game_canceled',
  GAME_RESCHEDULED = 'game_rescheduled',
  GAME_LOCATION_CHANGED = 'game_location_changed',
  
  // Message notifications
  NEW_MESSAGE = 'new_message',
  NEW_TEAM_MESSAGE = 'new_team_message',
  
  // Team notifications
  TEAM_UPDATE = 'team_update',
  TEAM_ROSTER_CHANGE = 'team_roster_change',
  PLAYER_ADDED = 'player_added',
  PLAYER_REMOVED = 'player_removed',
  
  // Homework notifications
  HOMEWORK_ASSIGNED = 'homework_assigned',
  HOMEWORK_DUE = 'homework_due',
  HOMEWORK_COMPLETED = 'homework_completed',
  
  // System notifications
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  WELCOME = 'welcome'
}

// Notification template model
export interface NotificationTemplate {
  id: NotificationEvent;
  category: NotificationCategory;
  defaultTitle: string;
  defaultBody: string;
  emailSubject: string;
  emailTemplate: string;
  smsTemplate: string;
  icon?: string;
  sound?: boolean;
  priority?: 'normal' | 'high';
  includeInDigest?: boolean;
}