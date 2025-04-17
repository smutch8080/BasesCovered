import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  OAuthProvider, 
  RecaptchaVerifier,
  connectAuthEmulator
} from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, getDoc, doc } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
auth.useDeviceLanguage(); // Use device's preferred language for SMS

// For development with emulators
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  // Connect to emulators for local development
  connectAuthEmulator(auth, 'http://localhost:9099');
  const db = getFirestore(app);
  connectFirestoreEmulator(db, 'localhost', 8080);
  const storage = getStorage(app);
  connectStorageEmulator(storage, 'localhost', 9199);
}

// Initialize providers
export const googleProvider = new GoogleAuthProvider();
// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
// Add scopes for better profile access
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Initialize Apple provider
export const appleProvider = new OAuthProvider('apple.com');
// Configure Apple provider
appleProvider.addScope('email');
appleProvider.addScope('name');

// Helper function to initialize reCAPTCHA verifier for phone auth
export const initRecaptchaVerifier = (containerId: string) => {
  try {
    console.log(`Initializing reCAPTCHA verifier for container: ${containerId}`);
    
    // Check if container exists
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container with ID ${containerId} not found`);
      throw new Error(`reCAPTCHA container not found: ${containerId}`);
    }
    
    // Clear any existing reCAPTCHA widgets
    container.innerHTML = '';
    
    // Set up configuration
    const verifierOptions = {
      'size': 'invisible' as const,
      'callback': (response: string) => {
        // reCAPTCHA solved, allow signup
        console.log('reCAPTCHA verified successfully:', response.substring(0, 10) + '...');
      },
      'expired-callback': () => {
        // Response expired. Ask user to solve reCAPTCHA again.
        console.log('reCAPTCHA expired, please solve again');
      },
      'error-callback': (error: any) => {
        console.error('reCAPTCHA error:', error);
      }
    };
    
    console.log('Creating RecaptchaVerifier with options:', JSON.stringify({
      size: verifierOptions.size,
    }));
    
    const recaptchaVerifier = new RecaptchaVerifier(auth, containerId, verifierOptions);
    
    // Force render the reCAPTCHA widget
    console.log('Rendering reCAPTCHA widget...');
    recaptchaVerifier.render().then(() => {
      console.log('reCAPTCHA rendered successfully');
    }).catch((error) => {
      console.error('Failed to render reCAPTCHA:', error);
    });
    
    console.log('reCAPTCHA verifier created successfully');
    return recaptchaVerifier;
  } catch (error) {
    console.error('Error creating reCAPTCHA verifier:', error);
    throw error;
  }
};

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

// Initialize Messaging
let messaging: any = null;

// Initialize and get messaging instance
export const getFirebaseMessaging = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.error('Service workers are not supported in this browser');
    return null;
  }
  
  if (!messaging) {
    try {
      // Ensure the service worker is registered before initializing messaging
      await navigator.serviceWorker.ready;
      
      // Initialize Firebase Messaging
      messaging = getMessaging(app);
      console.log('Firebase messaging initialized');
    } catch (error) {
      console.error('Error initializing Firebase messaging:', error);
      return null;
    }
  }
  
  return messaging;
};

// Get FCM token
export const getFCMToken = async (vapidKey: string): Promise<string | null> => {
  try {
    console.log('Getting FCM token with VAPID key:', vapidKey.substring(0, 10) + '...');
    
    // Check if we can access messaging
    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      console.error('Could not initialize Firebase Messaging');
      return null;
    }
    
    // Clear any existing local storage token to force a refresh
    try {
      localStorage.removeItem('fcm_token');
      console.log('Cleared existing token from localStorage');
    } catch (e) {
      console.warn('Could not access localStorage:', e);
    }
    
    // Try to get the token with retry logic
    const maxRetries = 3;
    let currentRetry = 0;
    let lastError = null;
    
    while (currentRetry < maxRetries) {
      try {
        console.log(`Attempting to get FCM token (attempt ${currentRetry + 1}/${maxRetries})...`);
        
        // Get the token with a timeout
        const tokenPromise = getToken(messaging, { 
          vapidKey, 
          serviceWorkerRegistration: await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js')
        });
        
        // Add a timeout to avoid hanging
        const timeoutPromise = new Promise<null>((resolve) => {
          setTimeout(() => {
            console.warn('FCM token request timed out');
            resolve(null);
          }, 5000);
        });
        
        // Race the token promise against the timeout
        const currentToken = await Promise.race([tokenPromise, timeoutPromise]);
        
        if (currentToken) {
          console.log(`FCM token obtained: ${currentToken.substring(0, 10)}...`);
          
          // Store it in localStorage for debugging and recovery purposes
          try {
            localStorage.setItem('fcm_token', currentToken);
            localStorage.setItem('fcm_token_timestamp', new Date().toISOString());
          } catch (e) {
            console.warn('Could not store token in localStorage:', e);
          }
          
          // Validate the token by sending a ping
          console.log('Validating token with server...');
          const isValid = await validateTokenWithServer(currentToken);
          
          if (isValid) {
            console.log('Token validated successfully');
            return currentToken;
          } else {
            console.warn('Server could not validate token, trying again...');
            lastError = new Error('Token validation failed');
            currentRetry++;
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
        } else {
          console.warn('Failed to get FCM token, received null');
          lastError = new Error('Received null token');
          currentRetry++;
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
      } catch (error) {
        console.error('Error getting FCM token:', error);
        lastError = error;
        currentRetry++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // If we get here, we failed to get a token after max retries
    console.error(`Failed to get FCM token after ${maxRetries} attempts`);
    if (lastError) {
      console.error('Last error:', lastError);
    }
    return null;
  } catch (error) {
    console.error('Unexpected error getting FCM token:', error);
    return null;
  }
};

// Helper function to validate token with server
const validateTokenWithServer = async (token: string): Promise<boolean> => {
  try {
    // Check if the token exists in Firestore
    const tokenDoc = await getDoc(doc(db, 'notification_tokens', token));
    
    if (tokenDoc.exists()) {
      console.log('Token exists in Firestore');
      return true;
    }
    
    // If we have a current user, try registering it
    const currentUser = auth.currentUser;
    if (currentUser?.uid) {
      console.log(`Registering token for user ${currentUser.uid}`);
      
      // Register the token
      const { saveToken } = await import('../services/notifications');
      await saveToken(currentUser.uid, token);
      
      console.log('Token registered successfully');
      return true;
    } else {
      console.warn('No user available to register token');
      return false;
    }
  } catch (error) {
    console.error('Error validating token with server:', error);
    return false;
  }
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return 'denied';
  }
  
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  
  if (Notification.permission === 'denied') {
    console.log('Notification permission previously denied');
    return 'denied';
  }
  
  // Request permission
  console.log('Requesting notification permission...');
  const permission = await Notification.requestPermission();
  console.log(`Notification permission ${permission}`);
  return permission;
};

// Handle foreground messages
export const onForegroundMessage = (callback: (payload: any) => void) => {
  // We need to use an async IIFE here since we can't make this function async
  // (because the return type wouldn't match the expected Unsubscribe function)
  let unsubscribe = () => {};
  
  (async () => {
    try {
      const messaging = await getFirebaseMessaging();
      if (!messaging) return;
      
      unsubscribe = onMessage(messaging, (payload) => {
        console.log('Message received in foreground:', payload);
        callback(payload);
      });
    } catch (error) {
      console.error('Error setting up foreground message handler:', error);
    }
  })();
  
  return () => unsubscribe();
};

// A minimal version of the service worker content
const MINIMAL_FCM_SW_CONTENT = `
// Firebase Cloud Messaging Service Worker - Minimal Version
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "${firebaseConfig.apiKey}",
  authDomain: "${firebaseConfig.authDomain}",
  projectId: "${firebaseConfig.projectId}",
  storageBucket: "${firebaseConfig.storageBucket}",
  messagingSenderId: "${firebaseConfig.messagingSenderId}",
  appId: "${firebaseConfig.appId}"
});

const messaging = firebase.messaging();
console.log('[firebase-messaging-sw.js] Initialized');

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  const title = payload.notification?.title || 'BasesCovered';
  const options = {
    body: payload.notification?.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    data: payload.data
  };
  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
`;

// Register Firebase service worker with proper MIME type handling
export const registerFirebaseServiceWorker = async () => {
  try {
    console.log('Registering Firebase service worker...');
    
    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      console.error('Service workers are not supported in this browser');
      return null;
    }
    
    // First check for existing registrations
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    // Check if Firebase Messaging service worker is already registered
    for (const registration of registrations) {
      if (registration.active?.scriptURL.includes('firebase-messaging-sw.js')) {
        console.log('Found existing Firebase messaging service worker:', registration);
        
        // Try to update it
        try {
          await registration.update();
          console.log('Firebase messaging service worker updated');
          return registration;
        } catch (updateError) {
          console.warn('Error updating existing service worker:', updateError);
          // Continue with re-registration
        }
      }
    }
    
    // Direct service worker registration with cache-busting to avoid caching issues
    const swUrl = `/firebase-messaging-sw.js?v=${Date.now()}`;
    
    try {
      // Register the service worker directly
      const registration = await navigator.serviceWorker.register(swUrl, { 
        scope: '/' 
      });
      
      console.log('Firebase service worker registered successfully via direct URL');
      return registration;
    } catch (directError) {
      console.error('Error registering service worker directly:', directError);
      
      // Try using the loader script approach
      console.log('Falling back to service worker loader script approach...');
      if (!document.querySelector('script[src="/firebase-messaging-sw-loader.js"]')) {
        const script = document.createElement('script');
        script.src = '/firebase-messaging-sw-loader.js';
        script.async = true;
        document.head.appendChild(script);
      }
      
      // Wait a moment for the loader to execute
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try to get the registration after the loader has run
      try {
        for (const registration of await navigator.serviceWorker.getRegistrations()) {
          if (registration.active?.scriptURL.includes('firebase-messaging-sw.js')) {
            return registration;
          }
        }
      } catch (error) {
        console.error('Error getting service worker registrations after loader:', error);
      }
      
      return null;
    }
  } catch (error) {
    console.error('Error registering Firebase service worker:', error);
    return null;
  }
};

// Call the test notification cloud function
export const testNotification = async (data: {
  type: 'user' | 'team';
  userId?: string;
  teamId?: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}): Promise<any> => {
  try {
    console.log('Calling testNotification cloud function with data:', data);
    
    // Make sure we have all required data
    if (!data.type || !data.title || !data.body) {
      throw new Error('Missing required data for notification test');
    }
    
    if (data.type === 'user' && !data.userId) {
      throw new Error('User ID is required for user notifications');
    }
    
    if (data.type === 'team' && !data.teamId) {
      throw new Error('Team ID is required for team notifications');
    }
    
    // Get Firebase functions instance
    const functions = getFunctions();
    
    // Get the testNotification callable function
    const testNotificationFn = httpsCallable(functions, 'testNotification');
    
    // Call the function with the data
    const result = await testNotificationFn(data);
    console.log('Notification test result:', result.data);
    
    return result.data;
  } catch (error) {
    console.error('Error testing notification:', error);
    throw error;
  }
};

// Export app instance
export default app;