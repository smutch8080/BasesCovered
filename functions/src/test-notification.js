const admin = require('firebase-admin');
const serviceAccount = require('../service-account-key.json');

// Initialize Firebase Admin with your service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

/**
 * Test function to send a notification to a specific user
 * @param {string} userId - The user ID to send the notification to
 */
async function testSendPushToUser(userId) {
  try {
    console.log(`Sending test notification to user: ${userId}`);
    
    // Call your cloud function directly using the Admin SDK
    const result = await admin.functions().httpsCallable('sendPushToUser')({
      userId,
      title: 'Test Notification',
      body: 'This is a test notification from the Cloud Function',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      tag: 'test',
      data: {
        testKey: 'testValue',
        timestamp: Date.now()
      },
      url: '/notifications/test'
    });
    
    console.log('Notification sent successfully!');
    console.log('Result:', JSON.stringify(result.data, null, 2));
    return result.data;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

/**
 * Test function to send a notification to a team
 * @param {string} teamId - The team ID to send the notification to
 */
async function testSendPushToTeam(teamId) {
  try {
    console.log(`Sending test notification to team: ${teamId}`);
    
    // Call your cloud function directly using the Admin SDK
    const result = await admin.functions().httpsCallable('sendPushToTeam')({
      teamId,
      title: 'Team Test Notification',
      body: 'This is a test notification for the entire team',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      tag: 'team-test',
      data: {
        testKey: 'teamTestValue',
        timestamp: Date.now()
      },
      url: `/teams/${teamId}/notifications/test`
    });
    
    console.log('Team notification sent successfully!');
    console.log('Result:', JSON.stringify(result.data, null, 2));
    return result.data;
  } catch (error) {
    console.error('Error sending team notification:', error);
    throw error;
  }
}

// If running this script directly, execute the test
if (require.main === module) {
  // Replace these with actual user and team IDs from your database
  const testUserId = process.argv[2] || 'REPLACE_WITH_REAL_USER_ID';
  const testTeamId = process.argv[3] || 'REPLACE_WITH_REAL_TEAM_ID';
  
  const testType = process.argv[4] || 'user';
  
  if (testType === 'user') {
    testSendPushToUser(testUserId)
      .then(() => process.exit(0))
      .catch(err => {
        console.error(err);
        process.exit(1);
      });
  } else if (testType === 'team') {
    testSendPushToTeam(testTeamId)
      .then(() => process.exit(0))
      .catch(err => {
        console.error(err);
        process.exit(1);
      });
  } else {
    console.error('Invalid test type. Use "user" or "team".');
    process.exit(1);
  }
}

module.exports = {
  testSendPushToUser,
  testSendPushToTeam
}; 