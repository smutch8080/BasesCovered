import { NotificationCategory, NotificationEvent, NotificationTemplate } from './types';

// Type definitions for template functions
type EmailTemplateFunction = (...args: any[]) => string;
type SMSTemplateFunction = (...args: any[]) => string;

// Email templates
export const emailTemplates: Record<string, EmailTemplateFunction> = {
  welcome: (name: string) => `
    <h1>Welcome to BasesCovered, ${name}!</h1>
    <p>We're excited to have you join our platform for simplifying youth sports.</p>
    <p>Get started by exploring your dashboard and setting up your profile.</p>
  `,
  
  progressReport: (name: string, date: string) => `
    <h1>New Progress Report Available, ${name}!</h1>
    <p>Your coach has shared a new progress report (${date}).</p>
    <p>Log in to view your progress and coach's feedback!</p>
  `,
  
  award: (name: string, award: string, team: string) => `
    <h1>Congratulations, ${name}!</h1>
    <p>You've received the "${award}" award from ${team}.</p>
    <p>Login to see your achievement!</p>
  `,
  
  homeworkAssigned: (name: string, title: string, dueDate: string) => `
    <h1>New Homework Assigned, ${name}!</h1>
    <p>Your coach has assigned a new homework: "${title}"</p>
    <p>Due date: ${dueDate}</p>
    <p>Login to view and complete the assignment.</p>
  `,
  
  clinicRegistration: (name: string, clinic: string, date: string, location: string) => `
    <h1>Registration Confirmed, ${name}!</h1>
    <p>You're registered for the "${clinic}" clinic.</p>
    <p>Date: ${date}</p>
    <p>Location: ${location}</p>
      <p>We look forward to seeing you there!</p>
  `,
  
  practiceReminder: (name: string, team: string, time: string, location: string) => `
    <h1>Practice Reminder, ${name}!</h1>
    <p>Your ${team} practice is coming up!</p>
    <p>Time: ${time}</p>
    <p>Location: ${location}</p>
  `,
  
  gameReminder: (name: string, team: string, opponent: string, time: string, location: string) => `
    <h1>Game Reminder, ${name}!</h1>
    <p>${team} vs. ${opponent}</p>
    <p>Time: ${time}</p>
    <p>Location: ${location}</p>
    <p>Good luck!</p>
  `,
  
  newMessage: (name: string, sender: string) => `
    <h1>New Message, ${name}!</h1>
    <p>You have a new message from ${sender}.</p>
    <p>Login to read and reply!</p>
  `
};

// SMS templates
export const smsTemplates: Record<string, SMSTemplateFunction> = {
  welcome: (name: string) => `Welcome to BasesCovered, ${name}! We're excited to have you join our platform.`,
  
  progressReport: (name: string, date: string) => `${name}, a new progress report (${date}) is available. Log in to view!`,
  
  award: (name: string, award: string, team: string) => `Congratulations, ${name}! You've received the "${award}" award from ${team}.`,
  
  homeworkAssigned: (name: string, title: string, dueDate: string) => `${name}, new homework assigned: "${title}" - Due: ${dueDate}`,
  
  clinicRegistration: (name: string, clinic: string, date: string) => `${name}, your registration for "${clinic}" on ${date} is confirmed!`,
  
  practiceReminder: (name: string, team: string, time: string) => `Reminder: ${team} practice at ${time}`,
  
  gameReminder: (name: string, team: string, opponent: string, time: string) => `Game reminder: ${team} vs. ${opponent} at ${time}`,
  
  newMessage: (name: string, sender: string) => `${name}, you have a new message from ${sender}. Login to read!`
};

// Update NotificationTemplate to use correct function types
interface TemplatedNotification extends Omit<NotificationTemplate, 'emailTemplate' | 'smsTemplate'> {
  emailTemplate: EmailTemplateFunction;
  smsTemplate: SMSTemplateFunction;
}

// Push notification templates
export const notificationTemplates: TemplatedNotification[] = [
  // Practice notifications
  {
    id: NotificationEvent.PRACTICE_REMINDER,
    category: NotificationCategory.PRACTICE,
    defaultTitle: 'Practice Reminder',
    defaultBody: '{{teamName}} practice starts in {{timeUntil}}',
    emailSubject: 'Practice Reminder for {{teamName}}',
    emailTemplate: emailTemplates.practiceReminder,
    smsTemplate: smsTemplates.practiceReminder,
    icon: '/icons/practice.png',
    sound: true,
    priority: 'high',
    includeInDigest: true
  },
  {
    id: NotificationEvent.PRACTICE_CANCELED,
    category: NotificationCategory.PRACTICE,
    defaultTitle: 'Practice Canceled',
    defaultBody: '{{teamName}} practice scheduled for {{time}} has been canceled',
    emailSubject: 'Practice Canceled - {{teamName}}',
    emailTemplate: (name: string, team: string, time: string) => `
      <h1>Practice Canceled, ${name}</h1>
      <p>The ${team} practice scheduled for ${time} has been canceled.</p>
    `,
    smsTemplate: (name: string, team: string, time: string) => 
      `${name}, ${team} practice scheduled for ${time} has been canceled.`,
    icon: '/icons/practice-canceled.png',
    sound: true,
    priority: 'high',
    includeInDigest: false
  },
  
  // Game notifications
  {
    id: NotificationEvent.GAME_REMINDER,
    category: NotificationCategory.GAME,
    defaultTitle: 'Game Day!',
    defaultBody: '{{teamName}} vs {{opponent}} starts in {{timeUntil}} at {{location}}',
    emailSubject: 'Game Reminder: {{teamName}} vs {{opponent}}',
    emailTemplate: emailTemplates.gameReminder,
    smsTemplate: smsTemplates.gameReminder,
    icon: '/icons/game.png',
    sound: true,
    priority: 'high',
    includeInDigest: true
  },
  {
    id: NotificationEvent.GAME_START,
    category: NotificationCategory.GAME,
    defaultTitle: 'Game Starting!',
    defaultBody: '{{teamName}} vs {{opponent}} is starting now',
    emailSubject: 'Game Starting: {{teamName}} vs {{opponent}}',
    emailTemplate: (name: string, team: string, opponent: string) => `
      <h1>Game Starting Now, ${name}!</h1>
      <p>${team} vs. ${opponent} is beginning!</p>
      <p>Check the app for live updates.</p>
    `,
    smsTemplate: (name: string, team: string, opponent: string) => 
      `Game Starting: ${team} vs. ${opponent}. Check the app for live updates!`,
    icon: '/icons/game-start.png',
    sound: true,
    priority: 'high',
    includeInDigest: false
  },
  {
    id: NotificationEvent.GAME_END,
    category: NotificationCategory.GAME,
    defaultTitle: 'Game Ended',
    defaultBody: 'Final Score: {{teamName}} {{teamScore}} - {{opponent}} {{opponentScore}}',
    emailSubject: 'Game Result: {{teamName}} vs {{opponent}}',
    emailTemplate: (name: string, team: string, teamScore: string, opponent: string, opponentScore: string) => `
      <h1>Game Finished, ${name}!</h1>
      <p>Final Score:</p>
      <p>${team}: ${teamScore}</p>
      <p>${opponent}: ${opponentScore}</p>
      <p>Check the app for game details and stats.</p>
    `,
    smsTemplate: (name: string, team: string, teamScore: string, opponent: string, opponentScore: string) => 
      `Game Over: ${team} ${teamScore} - ${opponent} ${opponentScore}. Check the app for details!`,
    icon: '/icons/game-end.png',
    sound: false,
    priority: 'normal',
    includeInDigest: true
  },
  
  // Message notifications
  {
    id: NotificationEvent.NEW_MESSAGE,
    category: NotificationCategory.MESSAGE,
    defaultTitle: 'New Message',
    defaultBody: 'New message from {{senderName}}',
    emailSubject: 'New Message from {{senderName}}',
    emailTemplate: emailTemplates.newMessage,
    smsTemplate: smsTemplates.newMessage,
    icon: '/icons/message.png',
    sound: true,
    priority: 'high',
    includeInDigest: false
  },
  {
    id: NotificationEvent.NEW_TEAM_MESSAGE,
    category: NotificationCategory.MESSAGE,
    defaultTitle: 'New Team Message',
    defaultBody: 'New message in {{teamName}} chat',
    emailSubject: 'New Team Message - {{teamName}}',
    emailTemplate: (name: string, team: string, sender: string) => `
      <h1>New Team Message, ${name}!</h1>
      <p>${sender} posted in the ${team} team chat.</p>
      <p>Login to check it out!</p>
    `,
    smsTemplate: (name: string, team: string, sender: string) => 
      `${name}, ${sender} posted in the ${team} team chat. Login to check it out!`,
    icon: '/icons/team-message.png',
    sound: true,
    priority: 'normal',
    includeInDigest: true
  },
  
  // Homework notifications
  {
    id: NotificationEvent.HOMEWORK_ASSIGNED,
    category: NotificationCategory.HOMEWORK,
    defaultTitle: 'New Homework Assigned',
    defaultBody: '{{homeworkTitle}} - due on {{dueDate}}',
    emailSubject: 'New Homework Assigned',
    emailTemplate: emailTemplates.homeworkAssigned,
    smsTemplate: smsTemplates.homeworkAssigned,
    icon: '/icons/homework.png',
    sound: false,
    priority: 'normal',
    includeInDigest: true
  },
  {
    id: NotificationEvent.HOMEWORK_DUE,
    category: NotificationCategory.HOMEWORK,
    defaultTitle: 'Homework Due Today',
    defaultBody: '{{homeworkTitle}} is due today',
    emailSubject: 'Homework Due Today - {{homeworkTitle}}',
    emailTemplate: (name: string, title: string) => `
      <h1>Homework Due Today, ${name}!</h1>
      <p>Your homework "${title}" is due today.</p>
      <p>Login to submit it before the deadline.</p>
    `,
    smsTemplate: (name: string, title: string) => 
      `${name}, your homework "${title}" is due today. Login to submit it!`,
    icon: '/icons/homework-due.png',
    sound: true,
    priority: 'high',
    includeInDigest: false
  }
];

// Helper function to get a template by notification type
export function getNotificationTemplate(type: NotificationEvent): TemplatedNotification | undefined {
  return notificationTemplates.find(template => template.id === type);
}

// Helper to format notification content with variables
export function formatNotificationContent(
  template: string, 
  variables: Record<string, string>
): string {
  let content = template;
  Object.entries(variables).forEach(([key, value]) => {
    content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });
  return content;
}