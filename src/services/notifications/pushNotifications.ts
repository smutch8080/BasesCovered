import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db, getFCMToken, requestNotificationPermission } from '../../lib/firebase';
import app from '../../lib/firebase';
import { saveToken } from './index';
import { formatNotificationContent, getNotificationTemplate } from './templates';
import { NotificationCategory, NotificationEvent } from './types';

// Initialize Firebase Functions
const functions = getFunctions(app);

// Firebase Cloud Functions reference for sending notifications
const testNotificationFn = httpsCallable(functions, 'testNotification');

/**
 * Check if a user has push notification permissions enabled
 * @param userId User ID to check
 */
export async function hasUserEnabledPushNotifications(userId: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return false;
    
    const userData = userDoc.data();
    return userData?.notificationPreferences?.push === true;
  } catch (error) {
    console.error('Error checking push notification status:', error);
    return false;
  }
}

/**
 * Check if a user has enabled specific notification types
 * @param userId User ID to check
 * @param category Notification category to check
 */
export async function isNotificationCategoryEnabled(
  userId: string, 
  category: NotificationCategory
): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return false;
    
    const userData = userDoc.data();
    const prefs = userData?.notificationPreferences?.types;
    
    if (!prefs) return true; // Default to enabled if preferences don't exist
    
    // Map category to the correct preference key
    switch (category) {
      case NotificationCategory.PRACTICE:
        return prefs.practiceReminders !== false;
      case NotificationCategory.GAME:
        return prefs.gameReminders !== false || prefs.gameStartAlerts !== false || prefs.gameEndAlerts !== false;
      case NotificationCategory.MESSAGE:
        return prefs.newMessages !== false;
      case NotificationCategory.HOMEWORK:
        return prefs.homeworkReminders !== false;
      default:
        return true; // Default to enabled for other categories
    }
  } catch (error) {
    console.error('Error checking notification category status:', error);
    return true; // Default to enabled on error for reliability
  }
}

/**
 * Get the user's FCM tokens from Firestore
 * @param userId User ID
 */
export async function getUserTokens(userId: string): Promise<string[]> {
  try {
    const tokensRef = collection(db, 'notification_tokens');
    const q = query(tokensRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return [];
    
    return snapshot.docs.map(doc => doc.data().token);
  } catch (error) {
    console.error('Error fetching user tokens:', error);
    return [];
  }
}

/**
 * Send a push notification to a user
 * @param userId User ID to send notification to
 * @param eventType Notification event type
 * @param variables Variables to replace in the notification templates
 * @param additionalData Additional data to include in the notification
 */
export async function sendPushNotification(
  userId: string,
  eventType: NotificationEvent,
  variables: Record<string, string>,
  additionalData: Record<string, string> = {}
): Promise<{success: boolean, message?: string}> {
  try {
    // Get the notification template
    const template = getNotificationTemplate(eventType);
    if (!template) {
      console.error(`No template found for notification type: ${eventType}`);
      return { success: false, message: 'No template found for this notification type' };
    }
    
    // Check if we should bypass user preferences
    const shouldBypassPreferences = additionalData?.bypassPreferences === 'true';
    
    // Only check preferences if not bypassing them
    if (!shouldBypassPreferences) {
      // Check if user has enabled push notifications for this category
      const isPushEnabled = await hasUserEnabledPushNotifications(userId);
      if (!isPushEnabled) {
        console.log(`Push notifications disabled for user ${userId}`);
        return { success: false, message: 'Push notifications disabled for this user' };
      }
      
      const isCategoryEnabled = await isNotificationCategoryEnabled(userId, template.category);
      if (!isCategoryEnabled) {
        console.log(`Notifications for category ${template.category} disabled for user ${userId}`);
        return { success: false, message: 'This notification category is disabled for the user' };
      }
    }
    
    // Format the notification content
    const title = formatNotificationContent(template.defaultTitle, variables);
    const body = formatNotificationContent(template.defaultBody, variables);
    
    // Prepare data payload (ensure all values are strings)
    const data = {
      ...additionalData,
      notificationType: String(eventType),
      category: String(template.category),
      timestamp: String(Date.now())
    };
    
    // Send the notification using the Cloud Function
    const result = await testNotificationFn({
      type: 'user',
      userId,
      title,
      body,
      icon: template.icon || '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      tag: String(eventType),
      data,
      url: additionalData.url || '/'
    });
    
    console.log('Push notification sent:', result);
    return { success: true };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error sending notification'
    };
  }
}

/**
 * Send a notification to a team
 * @param teamId Team ID to send notification to
 * @param eventType Notification event type
 * @param variables Variables to replace in the notification templates
 * @param additionalData Additional data to include in the notification
 */
export async function sendTeamPushNotification(
  teamId: string,
  eventType: NotificationEvent,
  variables: Record<string, string>,
  additionalData: Record<string, string> = {}
): Promise<{success: boolean, message?: string}> {
  try {
    // Get the notification template
    const template = getNotificationTemplate(eventType);
    if (!template) {
      console.error(`No template found for notification type: ${eventType}`);
      return { success: false, message: 'No template found for this notification type' };
    }
    
    // Format the notification content
    const title = formatNotificationContent(template.defaultTitle, variables);
    const body = formatNotificationContent(template.defaultBody, variables);
    
    // Add team ID to the data
    const data = {
      ...additionalData,
      teamId: String(teamId),
      notificationType: String(eventType),
      category: String(template.category),
      timestamp: String(Date.now())
    };
    
    // The default URL for team notifications should point to the team
    const url = additionalData.url || `/teams/${teamId}`;
    
    // Send the notification using the Cloud Function
    const result = await testNotificationFn({
      type: 'team',
      teamId,
      title,
      body,
      icon: template.icon || '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      tag: String(eventType),
      data,
      url
    });
    
    console.log('Team push notification sent:', result);
    return { success: true };
  } catch (error) {
    console.error('Error sending team push notification:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error sending team notification'
    };
  }
}

/**
 * Send a game start notification to all team members
 * @param gameId Game ID
 * @param teamId Team ID
 * @param opponentName Opponent team name
 */
export async function sendGameStartNotification(
  gameId: string,
  teamId: string,
  teamName: string,
  opponentName: string
): Promise<{success: boolean, message?: string}> {
  return sendTeamPushNotification(
      teamId,
    NotificationEvent.GAME_START,
    {
      teamName,
      opponent: opponentName
    },
    {
      gameId,
      url: `/games/${gameId}`
    }
  );
}

/**
 * Send a game end notification to all team members
 * @param gameId Game ID
 * @param teamId Team ID
 * @param teamName Team name
 * @param teamScore Team score
 * @param opponentName Opponent name
 * @param opponentScore Opponent score
 */
export async function sendGameEndNotification(
  gameId: string,
  teamId: string,
  teamName: string,
  teamScore: number,
  opponentName: string,
  opponentScore: number
): Promise<{success: boolean, message?: string}> {
  return sendTeamPushNotification(
      teamId,
    NotificationEvent.GAME_END,
    {
      teamName,
      teamScore: String(teamScore),
      opponent: opponentName,
      opponentScore: String(opponentScore)
    },
    {
      gameId,
      url: `/games/${gameId}`
    }
  );
}

/**
 * Send a new message notification to a user
 * @param userId Recipient user ID
 * @param senderName Name of the message sender
 * @param messageId Message ID for deep linking
 */
export async function sendNewMessageNotification(
  userId: string,
  senderName: string,
  messageId: string,
  conversationId: string
): Promise<{success: boolean, message?: string}> {
  return sendPushNotification(
    userId,
    NotificationEvent.NEW_MESSAGE,
    {
      senderName
    },
    {
      messageId,
      conversationId,
      url: `/messages/${conversationId}`
    }
  );
}

/**
 * Send a new team message notification to all team members
 * @param teamId Team ID
 * @param teamName Team name
 * @param senderName Name of the message sender
 * @param chatId Team chat ID
 */
export async function sendTeamMessageNotification(
  teamId: string,
  teamName: string,
  senderName: string,
  chatId: string
): Promise<{success: boolean, message?: string}> {
  return sendTeamPushNotification(
    teamId,
    NotificationEvent.NEW_TEAM_MESSAGE,
    {
      teamName,
      senderName
    },
    {
      chatId,
      url: `/teams/${teamId}/chat`
    }
  );
}

/**
 * Send a practice reminder notification to all team members
 * @param practiceId Practice ID
 * @param teamId Team ID
 * @param teamName Team name
 * @param startTime Practice start time
 * @param timeUntil Human-readable time until practice starts
 * @param location Practice location
 */
export async function sendPracticeReminderNotification(
  practiceId: string,
  teamId: string,
  teamName: string,
  startTime: string,
  timeUntil: string,
  location: string
): Promise<{success: boolean, message?: string}> {
  return sendTeamPushNotification(
    teamId,
    NotificationEvent.PRACTICE_REMINDER,
    {
      teamName,
      startTime,
      timeUntil,
      location
    },
    {
      practiceId,
      url: `/teams/${teamId}/practices/${practiceId}`
    }
  );
}

/**
 * Send a game reminder notification to all team members
 * @param gameId Game ID
 * @param teamId Team ID
 * @param teamName Team name
 * @param opponentName Opponent name
 * @param startTime Game start time
 * @param timeUntil Human-readable time until game starts
 * @param location Game location
 */
export async function sendGameReminderNotification(
  gameId: string,
  teamId: string,
  teamName: string,
  opponentName: string,
  startTime: string,
  timeUntil: string,
  location: string
): Promise<{success: boolean, message?: string}> {
  return sendTeamPushNotification(
    teamId,
    NotificationEvent.GAME_REMINDER,
    {
      teamName,
      opponent: opponentName,
      startTime,
      timeUntil,
      location
    },
    {
      gameId,
      url: `/games/${gameId}`
    }
  );
}

/**
 * Send a homework assignment notification to a user
 * @param userId User ID
 * @param homeworkId Homework ID
 * @param homeworkTitle Homework title
 * @param dueDate Due date
 */
export async function sendHomeworkAssignedNotification(
  userId: string,
  homeworkId: string,
  homeworkTitle: string,
  dueDate: string
): Promise<{success: boolean, message?: string}> {
  return sendPushNotification(
    userId,
    NotificationEvent.HOMEWORK_ASSIGNED,
    {
      homeworkTitle,
      dueDate
    },
    {
      homeworkId,
      url: `/homework/${homeworkId}`
    }
  );
} 