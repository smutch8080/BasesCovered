import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Team } from '../../src/types/team';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

// Import modules after initialization
import * as notificationsModule from './notifications';
import * as teamManagementModule from './teamManagement';

// Re-export all functions from other modules
export const sendPushToUser = notificationsModule.sendPushToUser;
export const sendPushToTeam = notificationsModule.sendPushToTeam;
export const onNewPracticePlan = notificationsModule.onNewPracticePlan;

// Export team management functions
export const handleJoinRequest = teamManagementModule.handleJoinRequest;
export const addPlayerToTeam = teamManagementModule.addPlayerToTeam;
export const assignParentToPlayer = teamManagementModule.assignParentToPlayer;
export const removePlayerFromTeam = teamManagementModule.removePlayerFromTeam;
export const validateTeamInvite = teamManagementModule.validateTeamInvite;
export const updatePlayerDetails = teamManagementModule.updatePlayerDetails;
export const removeCoachFromTeam = teamManagementModule.removeCoachFromTeam;
export const unlinkParentFromPlayer = teamManagementModule.unlinkParentFromPlayer;

// Helper function to check if a user is a team admin
const isTeamAdmin = (userId: string, team: Team): boolean => {
  return (
    team.coachId === userId ||
    team.coaches?.includes(userId)
  );
};

// Simple ping function to test connectivity
export const pingTest = functions.https.onCall(async (data, context) => {
  try {
    return {
      success: true,
      timestamp: Date.now(),
      message: "Firebase Functions are working correctly",
      auth: context.auth ? {
        uid: context.auth.uid,
        token: {
          name: context.auth.token.name,
          email: context.auth.token.email,
          role: context.auth.token.role
        }
      } : null
    };
  } catch (error) {
    console.error('Error in pingTest function:', error);
    throw new functions.https.HttpsError('internal', error instanceof Error ? error.message : 'Unknown error');
  }
});

// HTTP Endpoint for ping (no authentication required)
export const ping = functions.https.onRequest((request, response) => {
  // Set CORS headers
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }
  
  response.set('Content-Type', 'application/json');
  response.status(200).json({
    success: true,
    timestamp: Date.now(),
    message: "Cloud Functions are accessible",
    environment: process.env.NODE_ENV || 'unknown'
  });
});

// Test notification function (callable)
export const testNotification = functions.https.onCall(async (data, context) => {
  // Require authentication for this function
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  try {
    // Validate data
    if (!data || !data.type) {
      throw new functions.https.HttpsError('invalid-argument', 'Notification type is required');
    }

    if (!data.title || !data.body) {
      throw new functions.https.HttpsError('invalid-argument', 'Title and body are required');
    }

    let result;

    // Handle different notification types
    if (data.type === 'user') {
      const userId = data.userId;
      
      if (!userId) {
        console.error('User ID is required for user notifications');
        return { success: false, error: 'User ID is required' };
      }
      
      console.log(`Sending test notification to user: ${userId}`);
      
      // Prepare notification data with all values as strings
      const notificationData: Record<string, string> = {};
      if (data.data) {
        Object.entries(data.data).forEach(([key, value]) => {
          notificationData[key] = String(value);
        });
      }
      
      // Add standard notification metadata
      notificationData.timestamp = String(Date.now());
      notificationData.notificationType = String(data.tag || 'test-notification');
      notificationData.category = String(data.category || 'test');
      
      // Add URL if provided
      if (data.url) {
        notificationData.url = String(data.url);
      }
      
      // Create the webpush options
      const webpushOptions = {
        webpush: {
          notification: {
            icon: data.icon || '/icons/icon-192.png',
            badge: data.badge || '/icons/icon-72.png',
            tag: String(data.tag || 'test-notification'),
            vibrate: [200, 100, 200, 100, 200],
            requireInteraction: true
          },
          fcmOptions: {
            link: data.url || '/'
          }
        },
        android: {
          notification: {
            icon: data.icon || '/icons/icon-192.png',
            color: '#4b8eda',
            channelId: 'high_importance_channel',
            priority: 'high',
            sound: 'default',
          }
        },
        apns: {
          payload: {
            aps: {
              badge: 1,
              sound: 'default',
            }
          }
        }
      };
      
      // Import the notifications module (to avoid circular dependency)
      const { sendPushToUser } = require('./notifications');
      
      // Call the original function directly, not through the HTTP callable interface
      try {
        // This function is now a callable, so we need to simulate the callable interface
        result = await sendPushToUser.run({
          data: {
            userId,
            title: data.title,
            body: data.body,
            data: notificationData,
            options: webpushOptions
          },
          auth: context.auth
        }, {
          auth: context.auth
        });
        
        console.log(`Test notification result:`, result);
      } catch (callError) {
        console.error('Error calling sendPushToUser:', callError);
        result = { 
          success: false, 
          error: callError instanceof Error ? callError.message : 'Unknown error calling notification function' 
        };
      }
    } else if (data.type === 'team') {
      // Process team notification
      if (!data.teamId) {
        throw new functions.https.HttpsError('invalid-argument', 'Team ID is required for team notifications');
      }

      console.log(`Sending team notification to team ${data.teamId}`);
      
      // Get the team data to verify it exists
      const teamDoc = await admin.firestore().collection('teams').doc(data.teamId).get();
       
      if (!teamDoc.exists) {
        return {
          success: false,
          message: `Team with ID ${data.teamId} not found`
        };
      }

      // Get all members of the team
      const teamData = teamDoc.data();
      if (!teamData) {
        return { success: false, message: 'Team data is empty' };
      }
    
      const members = [
        ...(teamData.coaches || []),
        ...(teamData.managers || []),
        ...(teamData.players || []),
        ...(teamData.parents || [])
      ];

      if (members.length === 0) {
        return { success: false, message: 'No members in this team' };
      }

      // Prepare notification data with all values as strings
      const notificationData: Record<string, string> = {};
      if (data.data) {
        Object.entries(data.data).forEach(([key, value]) => {
          notificationData[key] = String(value);
        });
      }
      
      // Add standard notification metadata
      notificationData.timestamp = String(Date.now());
      notificationData.notificationType = String(data.tag || 'team-notification');
      notificationData.teamId = String(data.teamId);
      notificationData.category = String(data.category || 'team');
      
      // Add URL if provided
      if (data.url) {
        notificationData.url = String(data.url);
      }
      
      // Create the webpush options
      const webpushOptions = {
        webpush: {
          notification: {
            icon: data.icon || '/icons/icon-192.png',
            badge: data.badge || '/icons/icon-72.png',
            tag: String(data.tag || 'team-notification'),
            vibrate: [200, 100, 200, 100, 200],
            requireInteraction: true
          },
          fcmOptions: {
            link: data.url || '/'
          }
        },
        android: {
          notification: {
            icon: data.icon || '/icons/icon-192.png',
            color: '#4b8eda',
            channelId: 'high_importance_channel',
            priority: 'high',
            sound: 'default',
          }
        },
        apns: {
          payload: {
            aps: {
              badge: 1,
              sound: 'default',
            }
          }
        }
      };
      
      // Get all notification tokens for team members
      const tokensSnapshot = await admin.firestore()
        .collection('notification_tokens')
        .where('userId', 'in', members)
        .get();

      if (tokensSnapshot.empty) {
        return { success: false, message: 'No notification tokens found for team members' };
      }
      
      // Import the notifications module
      const { sendPushToUser } = require('./notifications');
      
      // Send notifications to each team member
      const notificationPromises = Array.from(new Set(members)).map(async (memberId) => {
        try {
          // Send notification to this team member
          const memberResult = await sendPushToUser.run({
            data: {
              userId: memberId,
              title: data.title,
              body: data.body,
              data: notificationData,
              options: webpushOptions
            },
            auth: context.auth
          }, {
            auth: context.auth
          });
          
          return {
            memberId,
            ...memberResult
          };
        } catch (error) {
          console.error(`Error sending notification to team member ${memberId}:`, error);
          return { 
            memberId, 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          };
        }
      });
      
      // Wait for all notifications to be sent
      const memberResults = await Promise.all(notificationPromises);
      
      // Count successful notifications
      const successfulMembers = memberResults.filter(r => r.success).length;
      
      result = {
        success: successfulMembers > 0,
        message: `Sent notifications to ${successfulMembers}/${members.length} team members`,
        results: memberResults
      };
    } else {
      throw new functions.https.HttpsError('invalid-argument', `Invalid notification type: ${data.type}`);
    }

    return result;
  } catch (error) {
    console.error('Error in testNotification function:', error);
    throw new functions.https.HttpsError(
      'internal',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}); 