/**
 * Examples of using the notification system
 * 
 * This file demonstrates how to send various notification types
 * using the notification services.
 */

import { 
  sendGameEndNotification,
  sendGameReminderNotification, 
  sendGameStartNotification,
  sendHomeworkAssignedNotification,
  sendNewMessageNotification,
  sendPracticeReminderNotification,
  sendTeamMessageNotification
} from './pushNotifications';

/**
 * Example: Game reminder notification (1 hour before game)
 */
export async function sendGameReminders() {
  // In a real application, this would fetch upcoming games from the database
  // For this example, we'll just use mock data
  const upcomingGames = [
    {
      id: 'game123',
      teamId: 'team456',
      teamName: 'Tigers',
      opponentName: 'Lions',
      startTime: '2023-11-15T15:00:00Z',
      location: 'Main Field'
    }
  ];
  
  // Calculate time until game for each upcoming game
  for (const game of upcomingGames) {
    // Format start time for display
    const startTimeDate = new Date(game.startTime);
    const formattedTime = startTimeDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    // Calculate time until game
    const now = new Date();
    const timeUntilMs = startTimeDate.getTime() - now.getTime();
    const hoursUntil = Math.floor(timeUntilMs / (1000 * 60 * 60));
    const minutesUntil = Math.floor((timeUntilMs % (1000 * 60 * 60)) / (1000 * 60));
    const timeUntil = hoursUntil > 0 
      ? `${hoursUntil} hour${hoursUntil > 1 ? 's' : ''}`
      : `${minutesUntil} minute${minutesUntil > 1 ? 's' : ''}`;
    
    // Send the notification
    const result = await sendGameReminderNotification(
      game.id,
      game.teamId,
      game.teamName,
      game.opponentName,
      formattedTime,
      timeUntil,
      game.location
    );
    
    console.log(`Game reminder notification result for ${game.teamName}:`, result);
  }
}

/**
 * Example: Game start notification
 */
export async function sendGameStartingNotifications() {
  // In a real application, this would fetch games that are about to start
  // For this example, we'll just use mock data
  const startingGames = [
    {
      id: 'game123',
      teamId: 'team456',
      teamName: 'Tigers',
      opponentName: 'Lions'
    }
  ];
  
  for (const game of startingGames) {
    const result = await sendGameStartNotification(
      game.id,
      game.teamId,
      game.teamName,
      game.opponentName
    );
    
    console.log(`Game start notification result for ${game.teamName}:`, result);
  }
}

/**
 * Example: Game end notification
 */
export async function sendGameEndedNotifications() {
  // In a real application, this would fetch games that just ended
  // For this example, we'll just use mock data
  const endedGames = [
    {
      id: 'game123',
      teamId: 'team456',
      teamName: 'Tigers',
      teamScore: 5,
      opponentName: 'Lions',
      opponentScore: 3
    }
  ];
  
  for (const game of endedGames) {
    const result = await sendGameEndNotification(
      game.id,
      game.teamId,
      game.teamName,
      game.teamScore,
      game.opponentName,
      game.opponentScore
    );
    
    console.log(`Game end notification result for ${game.teamName}:`, result);
  }
}

/**
 * Example: Practice reminder notification
 */
export async function sendPracticeReminders() {
  // In a real application, this would fetch upcoming practices
  // For this example, we'll just use mock data
  const upcomingPractices = [
    {
      id: 'practice789',
      teamId: 'team456',
      teamName: 'Tigers',
      startTime: '2023-11-16T17:30:00Z',
      location: 'Training Field 2'
    }
  ];
  
  for (const practice of upcomingPractices) {
    // Format start time for display
    const startTimeDate = new Date(practice.startTime);
    const formattedTime = startTimeDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    // Calculate time until practice
    const now = new Date();
    const timeUntilMs = startTimeDate.getTime() - now.getTime();
    const hoursUntil = Math.floor(timeUntilMs / (1000 * 60 * 60));
    const minutesUntil = Math.floor((timeUntilMs % (1000 * 60 * 60)) / (1000 * 60));
    const timeUntil = hoursUntil > 0 
      ? `${hoursUntil} hour${hoursUntil > 1 ? 's' : ''}`
      : `${minutesUntil} minute${minutesUntil > 1 ? 's' : ''}`;
    
    const result = await sendPracticeReminderNotification(
      practice.id,
      practice.teamId,
      practice.teamName,
      formattedTime,
      timeUntil,
      practice.location
    );
    
    console.log(`Practice reminder notification result for ${practice.teamName}:`, result);
  }
}

/**
 * Example: New direct message notification
 */
export async function sendNewDirectMessageNotification(
  userId: string,
  senderName: string,
  messageId: string,
  conversationId: string
) {
  const result = await sendNewMessageNotification(
    userId,
    senderName,
    messageId,
    conversationId
  );
  
  console.log(`New message notification result for user ${userId}:`, result);
  return result;
}

/**
 * Example: New team chat message notification
 */
export async function sendNewTeamChatMessageNotification(
  teamId: string,
  teamName: string,
  senderName: string,
  chatId: string
) {
  const result = await sendTeamMessageNotification(
    teamId,
    teamName,
    senderName,
    chatId
  );
  
  console.log(`Team chat notification result for ${teamName}:`, result);
  return result;
}

/**
 * Example: Homework assignment notification
 */
export async function sendHomeworkAssignmentNotification(
  userId: string,
  homeworkId: string,
  homeworkTitle: string,
  dueDate: string
) {
  const result = await sendHomeworkAssignedNotification(
    userId,
    homeworkId,
    homeworkTitle,
    dueDate
  );
  
  console.log(`Homework assigned notification result for user ${userId}:`, result);
  return result;
}

/**
 * Set up scheduled notifications for upcoming events
 * In a real application, this would be run by a cron job or cloud function trigger
 */
export async function scheduleEventReminders() {
  // Schedule game reminders for 1 day before and 1 hour before
  await sendGameReminders();
  
  // Schedule practice reminders for 1 day before
  await sendPracticeReminders();
  
  console.log('Event reminders scheduled successfully');
} 