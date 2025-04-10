"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onNewPracticePlan = exports.sendPushToTeam = exports.sendPushToUser = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const webpush = require("web-push");
// Set VAPID details for Web Push
const vapidKeys = {
    publicKey: 'BCb-J3GoGZfatBeu66CmX4OxjLvEMPe3C1wKjJSaG5XkbVm7Yb3J9NoZqoNydQaITGLax2REpOztgKaAvEBay-g',
    privateKey: 'GYvMlBwNYxp10TTW17EzZqkXdsd5hn7PMsOqbiURyoQ'
};
// Initialize Web Push with VAPID keys
webpush.setVapidDetails('mailto:steve.mutch@gmail.com', // Change this to your actual email
vapidKeys.publicKey, vapidKeys.privateKey);
// Firebase Cloud Messaging setup
const messaging = admin.messaging();
const db = admin.firestore();
/**
 * Send push notification to a specific user
 */
exports.sendPushToUser = functions.https.onCall(async (data, context) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    // Check authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to send notifications');
    }
    try {
        const { userId, title, body, data: notificationData = {}, options = {} } = data;
        if (!userId || !title || !body) {
            throw new functions.https.HttpsError('invalid-argument', 'userId, title, and body are required');
        }
        console.log(`Preparing to send push notification to user ${userId}`);
        console.log(`Notification data:`, JSON.stringify(notificationData));
        // Ensure user exists
        const userDoc = await admin.firestore().collection('users').doc(userId).get();
        if (!userDoc.exists) {
            console.log(`User ${userId} not found`);
            return { success: false, message: `User ${userId} not found` };
        }
        // Get FCM tokens for this user
        const tokensSnapshot = await admin.firestore()
            .collection('notification_tokens')
            .where('userId', '==', userId)
            .get();
        if (tokensSnapshot.empty) {
            console.log(`No FCM tokens found for user ${userId}`);
            return { success: false, message: `No FCM tokens found for user ${userId}` };
        }
        console.log(`Found ${tokensSnapshot.docs.length} tokens for user ${userId}`);
        // Prepare the data payload - ensure all values are strings
        const messageData = {};
        for (const [key, value] of Object.entries(notificationData)) {
            messageData[key] = String(value);
        }
        // Add userId and timestamp to the data
        messageData.userId = String(userId);
        messageData.timestamp = String(Date.now());
        // Prepare notification options with defaults for all platforms
        const notificationOptions = {
            // Web push specific options
            webpush: Object.assign({ headers: Object.assign({ Urgency: 'high', TTL: '86400' }, (((_a = options.webpush) === null || _a === void 0 ? void 0 : _a.headers) || {})), notification: Object.assign({ icon: '/icons/icon-192.png', badge: '/icons/icon-72.png', vibrate: [200, 100, 200, 100, 200], requireInteraction: true, timestamp: Date.now() }, (((_b = options.webpush) === null || _b === void 0 ? void 0 : _b.notification) || {})), fcmOptions: Object.assign({ link: '/' }, (((_c = options.webpush) === null || _c === void 0 ? void 0 : _c.fcmOptions) || {})) }, (options.webpush || {})),
            // Android specific options
            android: Object.assign({ priority: 'high', ttl: 86400, notification: Object.assign({ icon: '/icons/icon-192.png', color: '#4b8eda', clickAction: 'FLUTTER_NOTIFICATION_CLICK', sound: 'default', channelId: 'high_importance_channel', priority: 'high', visibility: 'public' }, (((_d = options.android) === null || _d === void 0 ? void 0 : _d.notification) || {})) }, (options.android || {})),
            // iOS specific options (APNs)
            apns: Object.assign({ headers: Object.assign({ 'apns-priority': '10', 'apns-push-type': 'alert' }, (((_e = options.apns) === null || _e === void 0 ? void 0 : _e.headers) || {})), payload: Object.assign({ aps: Object.assign({ alert: {
                            title,
                            body
                        }, badge: 1, sound: 'default', 'content-available': 1, 'mutable-content': 1, category: 'NEW_MESSAGE_CATEGORY' }, (((_g = (_f = options.apns) === null || _f === void 0 ? void 0 : _f.payload) === null || _g === void 0 ? void 0 : _g.aps) || {})) }, (((_h = options.apns) === null || _h === void 0 ? void 0 : _h.payload) || {})), fcmOptions: Object.assign({ imageUrl: ((_k = (_j = options.apns) === null || _j === void 0 ? void 0 : _j.fcmOptions) === null || _k === void 0 ? void 0 : _k.imageUrl) || null }, (((_l = options.apns) === null || _l === void 0 ? void 0 : _l.fcmOptions) || {})) }, (options.apns || {})),
            // FCM options
            fcmOptions: Object.assign({ analyticsLabel: 'notification' }, (options.fcmOptions || {}))
        };
        // Send to all tokens
        const sendPromises = tokensSnapshot.docs.map(async (doc) => {
            const token = doc.id;
            try {
                console.log(`Sending notification to token: ${token.substring(0, 10)}...`);
                // Create the message with FCM
                const message = Object.assign({ token, notification: {
                        title,
                        body
                    }, data: messageData }, notificationOptions);
                console.log(`FCM message prepared:`, JSON.stringify({
                    token: token.substring(0, 10) + '...',
                    notification: message.notification,
                    dataKeys: Object.keys(messageData),
                    platforms: {
                        webpush: !!message.webpush,
                        android: !!message.android,
                        apns: !!message.apns
                    }
                }));
                // Send the message
                const response = await admin.messaging().send(message);
                console.log(`FCM message sent successfully:`, response);
                return { token, success: true };
            }
            catch (error) {
                console.error(`Error sending to token ${token.substring(0, 10)}...`, error);
                // If the token is invalid, remove it
                if (error.code === 'messaging/invalid-registration-token' ||
                    error.code === 'messaging/registration-token-not-registered') {
                    console.log(`Removing invalid token: ${token.substring(0, 10)}...`);
                    await admin.firestore().collection('notification_tokens').doc(token).delete();
                    return { token, success: false, error: error.code };
                }
                return { token, success: false, error: error.message || 'Unknown error' };
            }
        });
        const results = await Promise.all(sendPromises);
        const successCount = results.filter(r => r.success).length;
        // Combine results
        return {
            success: successCount > 0,
            message: `Successfully sent ${successCount}/${results.length} notifications to user ${userId}`,
            results
        };
    }
    catch (error) {
        console.error('Error in sendPushToUser:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Unknown error');
    }
});
/**
 * Send push notification to a team
 */
exports.sendPushToTeam = functions.https.onCall(async (data, context) => {
    try {
        // Check authentication
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to send notifications');
        }
        // Check required parameters
        if (!data.teamId || !data.title || !data.body) {
            throw new functions.https.HttpsError('invalid-argument', 'teamId, title, and body are required');
        }
        const { teamId, title, body, icon, badge, tag, data: messageData = {}, url } = data;
        // Get team data
        const teamDoc = await db.collection('teams').doc(teamId).get();
        if (!teamDoc.exists) {
            return { success: false, message: 'Team not found' };
        }
        const teamData = teamDoc.data();
        if (!teamData) {
            return { success: false, message: 'Team data is empty' };
        }
        // Get all team members
        const members = [
            ...(teamData.coaches || []),
            ...(teamData.managers || []),
            ...(teamData.players || []),
            ...(teamData.parents || [])
        ];
        if (members.length === 0) {
            return { success: false, message: 'No members in team' };
        }
        // Get notification tokens for all team members
        // Note: If there are many members, consider batching this query
        const tokensSnapshot = await db
            .collection('notification_tokens')
            .where('userId', 'in', members)
            .get();
        if (tokensSnapshot.empty) {
            return { success: false, message: 'No notification tokens found for team members' };
        }
        // Ensure all data values are strings
        const stringifiedData = {};
        Object.entries(messageData || {}).forEach(([key, value]) => {
            stringifiedData[key] = String(value);
        });
        // Add URL and teamId to data payload
        stringifiedData.teamId = teamId;
        if (url) {
            stringifiedData.url = url;
        }
        // Send notifications to all tokens
        const sendPromises = tokensSnapshot.docs.map(async (doc) => {
            const token = doc.id;
            try {
                const message = {
                    token,
                    notification: {
                        title,
                        body
                    },
                    webpush: {
                        notification: {
                            icon: icon || '/icons/icon-192.png',
                            badge: badge || '/icons/icon-72.png',
                            tag: tag || 'team-notification',
                            data: stringifiedData
                        },
                        fcmOptions: {
                            link: url || `/teams/${teamId}`
                        }
                    },
                    data: stringifiedData
                };
                await messaging.send(message);
                return { token: token.substring(0, 10) + '...', success: true };
            }
            catch (error) {
                console.error(`Error sending notification to token ${token}:`, error);
                // Check if token is invalid and remove it if necessary
                if (error instanceof Error &&
                    'code' in error &&
                    (error.code === 'messaging/invalid-registration-token' ||
                        error.code === 'messaging/registration-token-not-registered')) {
                    await db.collection('notification_tokens').doc(token).delete();
                    return { token: token.substring(0, 10) + '...', success: false, removed: true };
                }
                return {
                    token: token.substring(0, 10) + '...',
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }
        });
        const results = await Promise.all(sendPromises);
        const successCount = results.filter(r => r.success).length;
        return {
            success: successCount > 0,
            sent: successCount,
            total: results.length,
            results
        };
    }
    catch (error) {
        console.error('Error in sendPushToTeam:', error);
        throw new functions.https.HttpsError('internal', error instanceof Error ? error.message : 'Unknown error');
    }
});
/**
 * Trigger notification when a new practice plan is created
 */
exports.onNewPracticePlan = functions.firestore
    .document('practice_plans/{planId}')
    .onCreate(async (snapshot) => {
    try {
        const planData = snapshot.data();
        const { teamId, teamName, date } = planData;
        if (!teamId || !teamName) {
            console.log('Missing required fields in practice plan:', planData);
            return;
        }
        // Format date for display
        const formattedDate = date ? new Date(date).toLocaleDateString() : 'upcoming practice';
        // Send notification to team members
        const notificationData = {
            teamId,
            title: `New Practice Plan for ${teamName}`,
            body: `A new practice plan has been created for ${formattedDate}`,
            tag: 'practice-plan',
            url: `/teams/${teamId}/practices/${snapshot.id}`,
            data: {
                planId: snapshot.id,
                teamId,
                type: 'practice_plan',
                timestamp: String(Date.now())
            }
        };
        try {
            await sendTeamNotification(notificationData);
            console.log(`Practice plan notification sent for team ${teamName}`);
        }
        catch (error) {
            console.error('Error sending practice plan notification:', error);
        }
    }
    catch (error) {
        console.error('Error in onNewPracticePlan function:', error);
    }
});
/**
 * Utility function to send a notification to all members of a team
 * Used by the onNewPracticePlan trigger
 */
async function sendTeamNotification(data) {
    const { teamId, title, body, tag, url, data: messageData } = data;
    // Get team data
    const teamDoc = await db.collection('teams').doc(teamId).get();
    if (!teamDoc.exists) {
        console.log(`Team ${teamId} not found`);
        return { success: false, message: 'Team not found' };
    }
    const teamData = teamDoc.data();
    if (!teamData) {
        console.log(`Team ${teamId} data is empty`);
        return { success: false, message: 'Team data is empty' };
    }
    // Get all team members
    const members = [
        ...(teamData.coaches || []),
        ...(teamData.managers || []),
        ...(teamData.players || []),
        ...(teamData.parents || [])
    ];
    if (members.length === 0) {
        console.log(`No members in team ${teamId}`);
        return { success: false, message: 'No members in team' };
    }
    // Get notification tokens for all team members
    // Note: If there are many members, consider batching this query
    const tokensSnapshot = await db
        .collection('notification_tokens')
        .where('userId', 'in', members)
        .get();
    if (tokensSnapshot.empty) {
        console.log(`No notification tokens found for team ${teamId} members`);
        return { success: false, message: 'No notification tokens found for team members' };
    }
    // Ensure all data values are strings
    const stringifiedData = {};
    Object.entries(messageData || {}).forEach(([key, value]) => {
        stringifiedData[key] = String(value);
    });
    // Add URL and teamId to data payload
    stringifiedData.teamId = teamId;
    if (url) {
        stringifiedData.url = url;
    }
    // Send notifications to all tokens
    const sendPromises = tokensSnapshot.docs.map(async (doc) => {
        const token = doc.id;
        try {
            const message = {
                token,
                notification: {
                    title,
                    body
                },
                webpush: {
                    notification: {
                        icon: '/icons/icon-192.png',
                        badge: '/icons/icon-72.png',
                        tag: tag || 'team-notification',
                        data: stringifiedData
                    },
                    fcmOptions: {
                        link: url || `/teams/${teamId}`
                    }
                },
                data: stringifiedData
            };
            await messaging.send(message);
            return { token: token.substring(0, 10) + '...', success: true };
        }
        catch (error) {
            console.error(`Error sending notification to token ${token}:`, error);
            // Check if token is invalid and remove it if necessary
            if (error instanceof Error &&
                'code' in error &&
                (error.code === 'messaging/invalid-registration-token' ||
                    error.code === 'messaging/registration-token-not-registered')) {
                await db.collection('notification_tokens').doc(token).delete();
                return { token: token.substring(0, 10) + '...', success: false, removed: true };
            }
            return {
                token: token.substring(0, 10) + '...',
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    });
    const results = await Promise.all(sendPromises);
    const successCount = results.filter(r => r.success).length;
    return {
        success: successCount > 0,
        sent: successCount,
        total: results.length,
        results
    };
}
//# sourceMappingURL=notifications.js.map