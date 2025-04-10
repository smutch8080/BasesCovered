import { sendEmail } from './email';
import { sendSMS } from './sms';
import { NotificationDeliveryMethod as NotificationType, NotificationPayload } from './types';
import { 
  requestNotificationPermission, 
  getFCMToken, 
  onForegroundMessage 
} from '../../lib/firebase';
import { doc, setDoc, deleteDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

// VAPID key from Firebase Console -> Project Settings -> Cloud Messaging -> Web Configuration
const FIREBASE_VAPID_KEY = 'BCb-J3GoGZfatBeu66CmX4OxjLvEMPe3C1wKjJSaG5XkbVm7Yb3J9NoZqoNydQaITGLax2REpOztgKaAvEBay-g';

// Collection name for storing user tokens
const TOKEN_COLLECTION = 'notification_tokens';

export async function sendNotification(
  type: NotificationType,
  payload: NotificationPayload
) {
  try {
    switch (type) {
      case 'email':
        await sendEmail({
          to: payload.to,
          subject: payload.subject || 'Notification',
          text: payload.text,
          html: payload.html
        });
        break;
      case 'sms':
        await sendSMS({
          to: payload.to,
          text: payload.text
        });
        break;
      case 'both':
        await Promise.all([
          sendEmail({
            to: payload.to,
            subject: payload.subject || 'Notification',
            text: payload.text,
            html: payload.html
          }),
          sendSMS({
            to: payload.to,
            text: payload.text
          })
        ]);
        break;
      default:
        throw new Error(`Invalid notification type: ${type}`);
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

/**
 * Request notification permission and register the device if granted
 * @param userId The user ID to associate with the token
 * @returns A promise that resolves to true if successful, false otherwise
 */
export const registerForPushNotifications = async (userId: string): Promise<boolean> => {
  console.log(`Attempting to register for push notifications for user: ${userId}`);
  
  try {
    // Step 1: Check if notifications are supported
    if (!('Notification' in window)) {
      console.error('Notifications are not supported in this browser');
      return false;
    }
    
    // Step 2: Request permission if needed
    if (Notification.permission !== 'granted') {
      console.log('Requesting notification permission...');
      const permission = await requestNotificationPermission();
      
      if (permission !== 'granted') {
        console.log(`Notification permission not granted: ${permission}`);
        return false;
      }
      
      console.log('Notification permission granted');
    } else {
      console.log('Notification permission already granted');
    }
    
    // Step 3: Ensure service worker is registered
    console.log('Ensuring service worker is registered...');
    
    try {
      // First, unregister any existing FCM service workers to ensure a clean state
      const existingRegistrations = await navigator.serviceWorker.getRegistrations();
      
      // Find Firebase Messaging service workers and unregister them
      for (const registration of existingRegistrations) {
        if (registration.scope.includes('firebase-messaging') || 
            registration.active?.scriptURL.includes('firebase-messaging-sw.js')) {
          console.log('Unregistering existing FCM service worker:', registration.scope);
          await registration.unregister();
        }
      }
      
      // Now register the service worker with cache busting
      const timestamp = Date.now();
      const swUrl = `/firebase-messaging-sw.js?v=${timestamp}`;
      console.log(`Registering service worker from: ${swUrl}`);
      
      const swRegistration = await navigator.serviceWorker.register(swUrl, {
        scope: '/'
      });
      
      // Wait for the service worker to be activated
      if (swRegistration.installing) {
        console.log('Service worker is installing, waiting for activation...');
        
        await new Promise<void>((resolve) => {
          const installer = swRegistration.installing;
          if (!installer) {
            console.log('Installer disappeared, continuing anyway');
            resolve();
            return;
          }
          
          const stateChangeListener = (event: Event) => {
            if (event.target && 'state' in event.target && (event.target as any).state === 'activated') {
              console.log('Service worker activated');
              installer.removeEventListener('statechange', stateChangeListener);
              resolve();
            }
          };
          
          installer.addEventListener('statechange', stateChangeListener);
          
          // Timeout after 5 seconds to prevent hanging
          setTimeout(() => {
            installer?.removeEventListener('statechange', stateChangeListener);
            console.warn('Service worker activation timed out, continuing anyway');
            resolve();
          }, 5000);
        });
      }
      
      // Wait for the service worker to take control
      if (!navigator.serviceWorker.controller) {
        console.log('Waiting for service worker to take control...');
        
        // Force clients claim by sending message to service worker
        navigator.serviceWorker.ready.then(registration => {
          if (registration.active) {
            registration.active.postMessage({
              type: 'CLAIM_CLIENTS'
            });
          }
        });
        
        // Add timeout to prevent hanging
        await Promise.race([
          new Promise<void>(resolve => {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
              console.log('Service worker controller changed, now in control');
              resolve();
            }, { once: true });
          }),
          new Promise<void>(resolve => {
            setTimeout(() => {
              console.warn('Timed out waiting for controller change, continuing anyway');
              resolve();
            }, 3000);
          })
        ]);
      }
      
      console.log('Service worker registration successful');
    } catch (swError) {
      console.error('Error registering service worker:', swError);
      // Continue anyway, as Firebase might still work with existing service worker
    }
    
    // Step 4: Get VAPID key and retrieve token
    console.log('Getting FCM token...');
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    
    if (!vapidKey) {
      console.error('VAPID key not found');
      return false;
    }
    
    // Get token with our enhanced retry logic
    const token = await getFCMToken(vapidKey);
    
    if (!token) {
      console.error('Failed to get FCM token');
      return false;
    }
    
    console.log(`FCM token obtained: ${token.substring(0, 10)}...`);
    
    // Step 5: Save token to Firestore
    try {
      await saveToken(userId, token);
      console.log('Token saved to Firestore');
    } catch (saveError) {
      console.error('Error saving token to Firestore:', saveError);
      return false;
    }
    
    // Step 6: Test notification to verify everything is working
    try {
      console.log('Sending test notification to verify setup...');
      
      // Create a test notification using the Notification API directly
      const testNotification = new Notification('Notifications Enabled', {
        body: 'You have successfully enabled notifications',
        icon: '/icons/icon-192.png'
      });
      
      // Close after 3 seconds
      setTimeout(() => testNotification.close(), 3000);
    } catch (testError) {
      console.warn('Could not send test notification:', testError);
      // Continue anyway, this is just a test
    }
    
    return true;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return false;
  }
};

/**
 * Save FCM token to Firestore
 * @param userId The user ID to associate with the token
 * @param token The FCM token
 */
export const saveToken = async (userId: string, token: string): Promise<void> => {
  try {
    if (!userId) {
      console.error('Cannot save token: No user ID provided');
      throw new Error('User ID is required to save FCM token');
    }
    
    if (!token) {
      console.error('Cannot save token: No token provided');
      throw new Error('Token is required');
    }
    
    console.log(`Saving FCM token for user ${userId}`);
    
    const tokenRef = doc(db, TOKEN_COLLECTION, token);
    
    // Check if token already exists
    const tokenDoc = await getDoc(tokenRef);
    
    if (tokenDoc.exists()) {
      // Update existing token
      console.log('Token already exists, updating...');
      
      try {
        await updateDoc(tokenRef, {
          userId,
          lastUpdated: new Date()
        });
        console.log('Token updated successfully');
      } catch (updateError) {
        console.error('Error updating token:', updateError);
        throw updateError;
      }
    } else {
      // Save new token
      console.log('Creating new token document...');
      
      try {
        const tokenData = {
          userId,
          token,
          device: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language
          },
          createdAt: new Date(),
          lastUpdated: new Date()
        };
        
        await setDoc(tokenRef, tokenData);
        console.log('New token saved successfully');
      } catch (setError) {
        console.error('Error saving new token:', setError);
        throw setError;
      }
    }
  } catch (error) {
    console.error('Error saving token:', error);
    throw error;
  }
};

/**
 * Unregister device from push notifications
 * @param token The FCM token to unregister
 */
export const unregisterFromPushNotifications = async (token: string): Promise<boolean> => {
  try {
    if (!token) {
      console.log('No token provided for unregistration');
      return false;
    }
    
    // Remove token from Firestore
    const tokenRef = doc(db, TOKEN_COLLECTION, token);
    await deleteDoc(tokenRef);
    
    console.log('Successfully unregistered from push notifications');
    return true;
  } catch (error) {
    console.error('Error unregistering from push notifications:', error);
    return false;
  }
};

/**
 * Check if user has notifications enabled
 */
export const hasNotificationsEnabled = (): boolean => {
  return Notification.permission === 'granted';
};

/**
 * Listen for foreground messages and display them as notifications
 * @param callback Function to call when a message is received
 */
export const listenForForegroundMessages = (callback: (payload: any) => void): (() => void) => {
  return onForegroundMessage((payload) => {
    console.log('Foreground message received:', payload);
    
    // Display notification if it has notification data
    if (payload.notification) {
      const { title, body } = payload.notification;
      
      // Show notification using the Notification API
      if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
          body,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-72.png'
        });
        
        // Handle notification click
        notification.onclick = () => {
          const url = payload.data?.url || '/';
          window.open(url, '_blank');
          notification.close();
        };
      }
    }
    
    // Call the callback with the payload
    callback(payload);
  });
};