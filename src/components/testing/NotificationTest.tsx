import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { useAuth } from '../../contexts/AuthContext';
import { registerForPushNotifications, hasNotificationsEnabled, saveToken } from '../../services/notifications';
import app, { registerFirebaseServiceWorker, getFCMToken, requestNotificationPermission } from '../../lib/firebase';
import { Button, Input, Select, Textarea, Switch } from '../../components/ui';
import { Bell, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { getApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

// Initialize Firebase Functions
const functions = getFunctions(app);

// Connect to emulator in development environment
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  console.log('Using Firebase Functions emulator');
  connectFunctionsEmulator(functions, 'localhost', 5001);
}

interface NotificationTestProps {
  className?: string;
}

export const NotificationTest: React.FC<NotificationTestProps> = ({ className = '' }) => {
  const { currentUser } = useAuth();
  const [userId, setUserId] = useState<string>(currentUser?.id || '');
  const [teamId, setTeamId] = useState<string>('');
  const [title, setTitle] = useState<string>('Test Notification');
  const [body, setBody] = useState<string>('This is a test notification!');
  const [notificationType, setNotificationType] = useState<'user' | 'team'>('user');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(
    hasNotificationsEnabled()
  );
  const [diagnosticsResult, setDiagnosticsResult] = useState<Record<string, any> | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';

  // Enable notifications for the current user
  const enableNotifications = async () => {
    setLoading(true);
    
    try {
      // First, check if notifications are already enabled
      const enabled = await hasNotificationsEnabled();
      if (enabled) {
        toast.success('Notifications are already enabled');
        
        // Even if already enabled, let's make sure we have a token
        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
        if (vapidKey) {
          const fcmToken = await getFCMToken(vapidKey);
          if (fcmToken && currentUser) {
            // Save token to ensure it's in Firestore
            try {
              await saveToken(currentUser.id, fcmToken);
              setToken(fcmToken);
              toast.success('FCM token refreshed and saved');
            } catch (error) {
              console.error('Error saving token:', error);
            }
          }
        }
        
        setLoading(false);
        return;
      }
      
      // Initialize Firebase Messaging
      if (currentUser) {
        const success = await registerForPushNotifications(currentUser.id);
        if (success) {
          toast.success('Notifications enabled successfully');
          setNotificationsEnabled(true);
          
          // Get the token that was just registered
          const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
          if (vapidKey) {
            const fcmToken = await getFCMToken(vapidKey);
            if (fcmToken) {
              setToken(fcmToken);
            }
          }
        } else {
          toast.error('Failed to enable notifications');
        }
      } else {
        toast.error('You must be logged in to enable notifications');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast.error(`Failed to enable notifications: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // Add diagnostic message with timestamp
  const addDiagnostic = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDiagnostics(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  // Run diagnostic tests for service worker and notification setup
  const runDiagnostics = async () => {
    setStatus('loading');
    setDiagnostics([]); // Clear previous diagnostics
    addDiagnostic('Starting diagnostics...');
    setShowDiagnostics(true); // Automatically show diagnostic details
    
    try {
      // Create diagnostics result object
      const diagnosticResults: Record<string, any> = {
        notificationsSupported: false,
        serviceWorkerRegistered: false,
        notificationPermission: 'default',
        firebaseInitialized: false,
        firebaseToken: false,
        cloudFunctionsPing: false,
        browserSupport: {
          notifications: false,
          serviceWorker: false
        },
        serviceWorker: {
          hasFCMServiceWorker: false
        },
        tokenInFirestore: false
      };
      
      // Check if browser supports service workers
      if (!('serviceWorker' in navigator)) {
        addDiagnostic('❌ Service workers are not supported in this browser');
        diagnosticResults.browserSupport.serviceWorker = false;
        setStatus('error');
      } else {
        addDiagnostic('✅ Service workers are supported');
        diagnosticResults.browserSupport.serviceWorker = true;
      }
      
      // Check if browser supports notifications
      if (!('Notification' in window)) {
        addDiagnostic('❌ Notifications are not supported in this browser');
        diagnosticResults.browserSupport.notifications = false;
        diagnosticResults.notificationsSupported = false;
        setStatus('error');
      } else {
        addDiagnostic('✅ Notifications are supported');
        diagnosticResults.browserSupport.notifications = true;
        diagnosticResults.notificationsSupported = true;
      }
      
      // Check notification permission
      const permissionStatus = Notification.permission;
      addDiagnostic(`Current notification permission: ${permissionStatus}`);
      diagnosticResults.notificationPermission = permissionStatus;
      
      // Check for service worker registrations
      const registrations = await navigator.serviceWorker.getRegistrations();
      if (registrations.length === 0) {
        addDiagnostic('❌ No service workers are registered');
        diagnosticResults.serviceWorkerRegistered = false;
      } else {
        addDiagnostic(`✅ Found ${registrations.length} service worker registration(s):`);
        diagnosticResults.serviceWorkerRegistered = true;
        
        // Check for FCM service worker
        const hasFCMServiceWorker = registrations.some(
          reg => reg.active && reg.active.scriptURL.includes('firebase-messaging-sw.js')
        );
        diagnosticResults.serviceWorker.hasFCMServiceWorker = hasFCMServiceWorker;
        
        registrations.forEach((reg, i) => {
          addDiagnostic(`  ${i + 1}. Scope: ${reg.scope}, State: ${reg.active ? 'active' : 'inactive'}`);
          if (reg.active) {
            addDiagnostic(`     Script: ${reg.active.scriptURL}`);
          }
        });
      }
      
      // Check for firebase-messaging-sw.js file
      try {
        const response = await fetch('/firebase-messaging-sw.js');
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          addDiagnostic(`✅ firebase-messaging-sw.js file exists (Content-Type: ${contentType})`);
          
          if (!contentType || !contentType.includes('javascript')) {
            addDiagnostic('⚠️ Service worker has incorrect MIME type, but our loader should handle this');
            diagnosticResults.serviceWorkerError = 'Incorrect MIME type';
          }
        } else {
          addDiagnostic(`❌ firebase-messaging-sw.js file not found: ${response.status} ${response.statusText}`);
          diagnosticResults.serviceWorkerError = `File not found: ${response.status} ${response.statusText}`;
        }
      } catch (error) {
        addDiagnostic(`❌ Error checking for firebase-messaging-sw.js: ${error instanceof Error ? error.message : String(error)}`);
        diagnosticResults.serviceWorkerError = `Error checking file: ${error instanceof Error ? error.message : String(error)}`;
      }
      
      // Check for firebase-messaging-sw-loader.js file
      try {
        const response = await fetch('/firebase-messaging-sw-loader.js');
        if (response.ok) {
          addDiagnostic('✅ firebase-messaging-sw-loader.js file exists');
        } else {
          addDiagnostic(`❌ firebase-messaging-sw-loader.js file not found: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        addDiagnostic(`❌ Error checking for firebase-messaging-sw-loader.js: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      // Check environment variables
      if (!vapidKey) {
        addDiagnostic('❌ VAPID key is not configured');
      } else {
        addDiagnostic('✅ VAPID key is configured');
        diagnosticResults.firebaseInitialized = true;
      }
      
      // Check FCM token
      if (token) {
        addDiagnostic('✅ FCM token is available');
        diagnosticResults.firebaseToken = true;
        
        // Verify if the token is saved in Firestore
        try {
          const tokenRef = doc(db, 'notification_tokens', token);
          const tokenDoc = await getDoc(tokenRef);
          
          if (tokenDoc.exists()) {
            const tokenData = tokenDoc.data();
            addDiagnostic(`✅ FCM token found in Firestore for user: ${tokenData.userId}`);
            diagnosticResults.tokenInFirestore = true;
            
            // Log the entire token document for debugging
            console.log('Token document in Firestore:', tokenData);
            addDiagnostic(`Token document contains fields: ${Object.keys(tokenData).join(', ')}`);
            
            // Verify it's associated with the current user
            if (currentUser && tokenData.userId === currentUser.id) {
              addDiagnostic('✅ FCM token is associated with the current user');
            } else {
              addDiagnostic(`⚠️ FCM token is associated with a different user: ${tokenData.userId}`);
              addDiagnostic(`Current user ID: ${currentUser?.id}, Token user ID: ${tokenData.userId}`);
            }
          } else {
            addDiagnostic('❌ FCM token is not saved in Firestore');
            diagnosticResults.tokenInFirestore = false;
            
            // Try to save the token again
            if (currentUser) {
              try {
                await saveToken(currentUser.id, token);
                addDiagnostic('✅ Attempted to save token to Firestore again');
              } catch (saveError) {
                addDiagnostic(`❌ Error saving token to Firestore: ${saveError instanceof Error ? saveError.message : String(saveError)}`);
              }
            }
          }
        } catch (firestoreError) {
          addDiagnostic(`❌ Error checking token in Firestore: ${firestoreError instanceof Error ? firestoreError.message : String(firestoreError)}`);
        }
      } else {
        addDiagnostic('❌ FCM token is not available');
      }

      // Update the diagnostics result state
      setDiagnosticsResult(diagnosticResults);
      setStatus('success');
      addDiagnostic('Diagnostics completed');
      
      // Return true to indicate diagnostics completed successfully
      return true;
    } catch (error) {
      addDiagnostic(`❌ Error running diagnostics: ${error instanceof Error ? error.message : String(error)}`);
      setStatus('error');
      return false;
    }
  };

  // Register service worker manually
  const registerServiceWorker = async () => {
    setStatus('loading');
    addDiagnostic('Manually registering service worker...');
    
    try {
      // First check if we already have a Firebase Messaging service worker
      const registrations = await navigator.serviceWorker.getRegistrations();
      const hasFCMServiceWorker = registrations.some(
        reg => reg.active && reg.active.scriptURL.includes('firebase-messaging-sw.js')
      );
      
      if (hasFCMServiceWorker) {
        addDiagnostic('✅ Firebase messaging service worker is already registered');
        
        // Get the registration
        const fcmRegistration = registrations.find(
          reg => reg.active && reg.active.scriptURL.includes('firebase-messaging-sw.js')
        );
        
        if (fcmRegistration) {
          // Try to update the registration
          try {
            addDiagnostic('Updating existing service worker...');
            await fcmRegistration.update();
            addDiagnostic('✅ Service worker updated successfully');
          } catch (updateError) {
            addDiagnostic(`⚠️ Error updating service worker: ${updateError instanceof Error ? updateError.message : String(updateError)}`);
          }
          
          setStatus('success');
          return fcmRegistration;
        }
      }
      
      // Direct registration of the service worker file - the only approach that works consistently
      addDiagnostic('Registering service worker directly...');
      
      try {
        // Add cache-busting parameter to avoid caching issues
        const swUrl = `/firebase-messaging-sw.js?v=${Date.now()}`;
        const registration = await navigator.serviceWorker.register(swUrl, { 
          scope: '/' 
        });
        
        addDiagnostic(`✅ Service worker registered successfully (scope: ${registration.scope})`);
        
        // Wait for the service worker to be activated
        if (registration.installing) {
          addDiagnostic('Service worker is installing, waiting for activation...');
          
          await new Promise<void>((resolve) => {
            const stateChangeListener = (event: Event) => {
              // @ts-ignore
              if (event.target?.state === 'activated') {
                addDiagnostic('✅ Service worker activated');
                registration.installing?.removeEventListener('statechange', stateChangeListener);
                resolve();
              }
            };
            
            registration.installing?.addEventListener('statechange', stateChangeListener);
            
            // Add a timeout to avoid hanging if activation takes too long
            setTimeout(() => {
              registration.installing?.removeEventListener('statechange', stateChangeListener);
              addDiagnostic('⚠️ Service worker activation timeout - continuing anyway');
              resolve();
            }, 5000);
          });
        }
        
        // Double-check that the service worker has been properly registered
        // Sometimes it won't show up as firebase-messaging-sw.js in the list immediately
        setTimeout(async () => {
          const updatedRegistrations = await navigator.serviceWorker.getRegistrations();
          const hasFCMServiceWorkerNow = updatedRegistrations.some(
            reg => reg.active && reg.active.scriptURL.includes('firebase-messaging-sw.js')
          );
          
          if (hasFCMServiceWorkerNow) {
            addDiagnostic('✅ Confirmed Firebase messaging service worker is now registered');
          } else {
            addDiagnostic('⚠️ Registration successful but service worker may take time to appear as firebase-messaging-sw.js');
          }
        }, 1000);
        
        setStatus('success');
        return registration;
      } catch (directError) {
        addDiagnostic(`❌ Error registering service worker directly: ${directError instanceof Error ? directError.message : String(directError)}`);
        
        // Try the loader script approach as fallback
        addDiagnostic('Falling back to service worker loader script approach...');
        
        if (!document.querySelector('script[src="/firebase-messaging-sw-loader.js"]')) {
          const script = document.createElement('script');
          script.src = '/firebase-messaging-sw-loader.js';
          script.async = true;
          
          script.onload = () => {
            addDiagnostic('✅ Service worker loader script loaded');
          };
          
          script.onerror = (e) => {
            addDiagnostic(`❌ Error loading service worker loader script: ${e}`);
          };
          
          document.head.appendChild(script);
          addDiagnostic('Service worker loader script added to the page');
        } else {
          addDiagnostic('Service worker loader script already added to the page');
        }
      }
      
      // Wait for any service worker to be ready
      addDiagnostic('Waiting for service worker to be ready...');
      let attempts = 0;
      const maxAttempts = 5;
      
      while (attempts < maxAttempts) {
        try {
          const registration = await navigator.serviceWorker.ready;
          addDiagnostic(`✅ Service worker is ready (scope: ${registration.scope})`);
          
          // Check if this is our Firebase messaging service worker
          if (registration.active?.scriptURL.includes('firebase-messaging-sw.js')) {
            addDiagnostic('✅ Firebase messaging service worker is active');
          } else {
            addDiagnostic(`⚠️ Active service worker is not our Firebase messaging service worker: ${registration.active?.scriptURL}`);
          }
          
          setStatus('success');
          return registration;
        } catch (err) {
          addDiagnostic(`Waiting for service worker to be ready... (${attempts + 1}/${maxAttempts})`);
          attempts++;
          
          // Wait before trying again
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      addDiagnostic('❌ Service worker did not become ready after multiple attempts');
      setStatus('error');
      return null;
    } catch (error) {
      addDiagnostic(`❌ Error registering service worker: ${error instanceof Error ? error.message : String(error)}`);
      setStatus('error');
      return null;
    }
  };

  // Initialize notifications and get FCM token
  const initializeNotifications = async () => {
    setStatus('loading');
    addDiagnostic('Initializing notifications...');
    
    try {
      if (!vapidKey) {
        addDiagnostic('❌ VAPID key is not configured');
        setStatus('error');
        return false;
      }
      
      // Request notification permission
      const permissionResult = await requestNotificationPermission();
      if (!permissionResult) {
        addDiagnostic('❌ Notification permission not granted');
        setStatus('error');
        return false;
      }
      
      addDiagnostic(`✅ Notification permission: ${Notification.permission}`);
      
      // Check if service worker is registered
      const registrations = await navigator.serviceWorker.getRegistrations();
      const hasFCMServiceWorker = registrations.some(
        reg => reg.active && reg.active.scriptURL.includes('firebase-messaging-sw.js')
      );
      
      if (!hasFCMServiceWorker) {
        addDiagnostic('❌ Firebase Messaging service worker not registered');
        addDiagnostic('Attempting to register service worker first...');
        
        const registration = await registerServiceWorker();
        if (!registration) {
          addDiagnostic('❌ Failed to register service worker');
          setStatus('error');
          return false;
        }
      }
      
      // Wait for service worker to be active
      addDiagnostic('Waiting for service worker to be active...');
      
      // Verify service worker is ready
      try {
        const registration = await navigator.serviceWorker.ready;
        addDiagnostic(`✅ Service worker is ready at scope: ${registration.scope}`);
      } catch (swError) {
        addDiagnostic(`❌ Service worker not ready: ${swError instanceof Error ? swError.message : String(swError)}`);
        setStatus('error');
        return false;
      }
      
      // Get FCM token
      addDiagnostic('Requesting FCM token...');
      let fcmToken;
      
      try {
        fcmToken = await getFCMToken(vapidKey);
      } catch (tokenError) {
        addDiagnostic(`❌ Error getting FCM token: ${tokenError instanceof Error ? tokenError.message : String(tokenError)}`);
        setStatus('error');
        return false;
      }
      
      if (fcmToken) {
        setToken(fcmToken);
        addDiagnostic('✅ FCM token obtained successfully');
        
        // Save token to Firestore
        if (currentUser) {
          try {
            await saveToken(currentUser.id, fcmToken);
            addDiagnostic('✅ FCM token saved to Firestore');
          } catch (saveError) {
            addDiagnostic(`⚠️ Error saving FCM token to Firestore: ${saveError instanceof Error ? saveError.message : String(saveError)}`);
          }
        }
        
        // Try sending a test notification
        try {
          const notification = new Notification('Test Notification', {
            body: 'This is a test notification from the browser',
            icon: '/favicon.ico'
          });
          
          notification.onclick = () => {
            addDiagnostic('Notification clicked');
            notification.close();
          };
          
          addDiagnostic('✅ Test notification sent');
        } catch (notifError) {
          addDiagnostic(`⚠️ Error sending test notification: ${notifError instanceof Error ? notifError.message : String(notifError)}`);
        }
        
        setStatus('success');
        return true;
      } else {
        addDiagnostic('❌ Failed to obtain FCM token');
        setStatus('error');
        return false;
      }
    } catch (error) {
      addDiagnostic(`❌ Error initializing notifications: ${error instanceof Error ? error.message : String(error)}`);
      setStatus('error');
      return false;
    }
  };

  // Reset diagnostic state
  const resetDiagnostics = () => {
    setDiagnostics([]);
    setStatus('idle');
    setToken(null);
  };

  // Force save token to Firestore
  const forceSaveToken = async () => {
    setStatus('loading');
    
    if (!currentUser) {
      toast.error('You must be logged in to save a token');
      setStatus('error');
      return;
    }
    
    if (!token) {
      toast.error('No FCM token available to save');
      setStatus('error');
      return;
    }
    
    addDiagnostic('Forcing save of FCM token to Firestore...');
    
    try {
      await saveToken(currentUser.id, token);
      addDiagnostic('✅ FCM token saved to Firestore successfully');
      
      // Verify it was saved
      const tokenRef = doc(db, 'notification_tokens', token);
      const tokenDoc = await getDoc(tokenRef);
      
      if (tokenDoc.exists()) {
        const tokenData = tokenDoc.data();
        addDiagnostic(`✅ Verified token in Firestore for user: ${tokenData.userId}`);
        toast.success('Token saved to Firestore successfully');
      } else {
        addDiagnostic('❌ Token still not found in Firestore after save attempt');
        toast.error('Failed to save token to Firestore');
      }
      
      // Run diagnostics again to update the UI
      await runDiagnostics();
    } catch (error) {
      addDiagnostic(`❌ Error saving token to Firestore: ${error instanceof Error ? error.message : String(error)}`);
      toast.error(`Failed to save token: ${error instanceof Error ? error.message : String(error)}`);
      setStatus('error');
    }
  };

  // Send a test notification
  const handleSendNotification = async () => {
    if (!currentUser) {
      toast.error('You must be logged in to send notifications');
      return;
    }

    if (notificationType === 'user' && !userId) {
      toast.error('Please enter a user ID');
      return;
    }

    if (notificationType === 'team' && !teamId) {
      toast.error('Please enter a team ID');
      return;
    }

    if (!title || !body) {
      toast.error('Please enter a title and message');
      return;
    }

    setLoading(true);
    toast.loading('Sending notification...');

    try {
      // Check if we have an FCM token
      let currentToken = token;
      
      if (!currentToken) {
        // If no token, try to get one
        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
          toast.error('VAPID key not found in environment variables');
          setLoading(false);
          toast.dismiss();
          return;
        }
        
        try {
          // Ensure service worker is registered
          const swRegistration = await navigator.serviceWorker.getRegistration('/');
          if (!swRegistration) {
            // Try to register service worker
            toast.loading('Registering service worker...');
            await registerServiceWorker();
          }
          
          // Get fresh token
          console.log('Getting fresh FCM token...');
          currentToken = await getFCMToken(vapidKey);
          
          if (currentToken && currentUser) {
            // Explicitly save the token to Firestore
            try {
              await saveToken(currentUser.id, currentToken);
              setToken(currentToken);
              toast.success('FCM token obtained and saved successfully');
            } catch (saveError) {
              console.error('Error saving token:', saveError);
              toast.error('Could not save FCM token to database');
              setLoading(false);
              toast.dismiss();
              return;
            }
          } else {
            toast.error('Could not get FCM token. Please check browser permissions.');
            setLoading(false);
            toast.dismiss();
            return;
          }
        } catch (tokenError) {
          console.error('Error getting FCM token:', tokenError);
          toast.error('Error getting FCM token: ' + (tokenError instanceof Error ? tokenError.message : String(tokenError)));
          setLoading(false);
          toast.dismiss();
          return;
        }
      } else if (currentUser && currentToken) {
        // Make sure the existing token is saved to the current user
        try {
          await saveToken(currentUser.id, currentToken);
        } catch (saveError) {
          console.error('Error saving existing token:', saveError);
        }
      }
      
      // Create notification data
      const notificationData: Record<string, any> = {
        title,
        body,
        type: notificationType,
      };
      
      // Add target info based on notification type
      if (notificationType === 'user') {
        notificationData.userId = userId || currentUser.id; // Default to current user if empty
      } else if (notificationType === 'team') {
        notificationData.teamId = teamId;
      }
      
      console.log('Sending notification with data:', notificationData);
      
      // Add diagnostics before sending the notification
      if (currentToken) {
        console.log(`Using FCM token: ${currentToken.substring(0, 10)}... for notification`);
        
        // Verify if the token is in Firestore
        try {
          const tokenRef = doc(db, 'notification_tokens', currentToken);
          const tokenDoc = await getDoc(tokenRef);
          
          if (tokenDoc.exists()) {
            const tokenData = tokenDoc.data();
            console.log(`Token exists in Firestore for user: ${tokenData.userId}`);
            
            // Check if it's associated with the correct user
            if (tokenData.userId !== currentUser.id) {
              console.warn(`Token is associated with a different user (${tokenData.userId}) than the current user (${currentUser.id})`);
              
              // Try to update the token association
              try {
                await saveToken(currentUser.id, currentToken);
                console.log('Updated token association to current user');
              } catch (updateError) {
                console.error('Failed to update token association:', updateError);
              }
            }
          } else {
            console.warn('Token exists locally but not in Firestore');
            
            // Try to save the token again
            try {
              await saveToken(currentUser.id, currentToken);
              console.log('Saved token to Firestore before sending notification');
            } catch (saveError) {
              console.error('Failed to save token to Firestore:', saveError);
              toast.error('Could not save token to Firestore');
            }
          }
        } catch (checkError) {
          console.error('Error checking token in Firestore:', checkError);
        }
      }
      
      // Send the notification using Firebase Functions
      try {
        const testNotificationFunction = httpsCallable<
          Record<string, any>, 
          { success: boolean; message: string }
        >(functions, 'testNotification');
        
        const result = await testNotificationFunction(notificationData);
        
        console.log('Notification result:', result.data);
        setResult(result.data);
        
        if (result.data.success) {
          toast.success('Notification sent successfully!');
        } else {
          toast.error(`Failed to send notification: ${result.data.message || 'Unknown error'}`);
        }
      } catch (functionError: any) {
        console.error('Error calling test notification function:', functionError);
        
        // Handle specific Firebase errors
        if (functionError.code === 'functions/unavailable') {
          toast.error('Firebase Functions are currently unavailable. Please try again later.');
        } else if (functionError.code === 'functions/internal') {
          toast.error('Internal server error. The service worker might not be properly registered.');
          
          // Show detailed error info
          console.error('Firebase internal error details:', functionError.details || 'No details available');
          
          // Automatically try to run diagnostics and register service worker
          await runDiagnostics();
          await registerServiceWorker();
        } else {
          toast.error(`Error sending notification: ${functionError.message || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Unexpected error in send notification:', error);
      toast.error(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
      toast.dismiss();
    }
  };

  // Add this below the state declarations
  useEffect(() => {
    const checkServiceWorker = async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        const hasFCMServiceWorker = registrations.some(
          reg => reg.active && reg.active.scriptURL.includes('firebase-messaging-sw.js')
        );
        
        if (!hasFCMServiceWorker && notificationsEnabled) {
          console.log('Firebase Messaging service worker not found but notifications are enabled. Registering...');
          await registerServiceWorker();
        }
      } catch (error) {
        console.error('Error checking service worker registration on mount:', error);
      }
    };
    
    checkServiceWorker();
  }, [notificationsEnabled]);

  // Add this helper function to display troubleshooting steps
  const getTroubleshootingSteps = (diagnosticsResult: Record<string, any>) => {
    const issues: string[] = [];
    const solutions: string[] = [];
    
    // Check for FCM Service Worker registration
    if (diagnosticsResult.serviceWorker && !diagnosticsResult.serviceWorker.hasFCMServiceWorker) {
      issues.push('Firebase Messaging Service Worker is not registered');
      solutions.push('Click the "Register Service Worker" button to register it');
    }
    
    // Check notification permission
    if (diagnosticsResult.notificationPermission !== 'granted') {
      issues.push('Notification permission is not granted');
      solutions.push('Click the "Enable Notifications" button to request permission');
    }
    
    // Check Firebase configuration
    const missingConfigs = [];
    if (!import.meta.env.VITE_FIREBASE_API_KEY) missingConfigs.push('API Key');
    if (!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) missingConfigs.push('Auth Domain');
    if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) missingConfigs.push('Project ID');
    if (!import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) missingConfigs.push('Messaging Sender ID');
    if (!import.meta.env.VITE_FIREBASE_APP_ID) missingConfigs.push('App ID');
    if (!import.meta.env.VITE_FIREBASE_VAPID_KEY) missingConfigs.push('VAPID Key');
    
    if (missingConfigs.length > 0) {
      issues.push(`Missing Firebase configuration: ${missingConfigs.join(', ')}`);
      solutions.push('Check your .env or .env.local files for missing values');
    }
    
    // Check if Firebase Messaging is initialized
    if (diagnosticsResult.messaging && !diagnosticsResult.messaging.initialized) {
      issues.push('Firebase Messaging could not be initialized');
      solutions.push('Check the browser console for errors and make sure the service worker is properly registered');
    }
    
    // Check for HTTP connection issues
    if (diagnosticsResult.httpConnection && diagnosticsResult.httpConnection.error) {
      issues.push(`HTTP connection to Firebase Functions failed: ${diagnosticsResult.httpConnection.message}`);
      solutions.push('Verify your network connection and firewall settings');
    }
    
    // Check for service worker MIME type issues
    if (diagnosticsResult.serviceWorkerError && 
        (diagnosticsResult.serviceWorkerError.includes('MIME type') || 
         diagnosticsResult.serviceWorkerError.includes('failed to register'))) {
      issues.push('Service worker has MIME type issues');
      solutions.push('Try the "MIME Type Workaround" button to register using a blob URL');
    }
    
    // Check FCM token
    if (!diagnosticsResult.firebaseToken) {
      issues.push('FCM token not available');
      solutions.push('Click the "Initialize Notifications" button to get a new FCM token');
    }
    
    // Check if token is saved in Firestore
    if (diagnosticsResult.firebaseToken && !diagnosticsResult.tokenInFirestore) {
      issues.push('FCM token not saved in Firestore');
      solutions.push('The token is available but not saved in Firestore. Try running diagnostics again or enabling notifications');
    }
    
    if (issues.length === 0) {
      return (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p className="font-medium">All systems ready!</p>
          <p className="text-sm">Notifications are properly configured and should be working.</p>
        </div>
      );
    }
    
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        <p className="font-medium">Troubleshooting Required</p>
        <p className="text-sm mb-2">The following issues were detected:</p>
        <ul className="list-disc pl-5 mb-2">
          {issues.map((issue, i) => (
            <li key={i}>{issue}</li>
          ))}
        </ul>
        <p className="text-sm mb-2">Recommended solutions:</p>
        <ul className="list-decimal pl-5">
          {solutions.map((solution, i) => (
            <li key={i}>{solution}</li>
          ))}
        </ul>
        {diagnosticsResult.serviceWorkerError?.includes('MIME type') && (
          <div className="mt-3">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleMimeTypeWorkaround}
            >
              Try MIME Type Workaround
            </button>
          </div>
        )}
        
        {diagnosticsResult.firebaseToken && !diagnosticsResult.tokenInFirestore && (
          <div className="mt-3">
            <button
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
              onClick={forceSaveToken}
            >
              Force Save Token to Firestore
            </button>
          </div>
        )}
      </div>
    );
  };

  // Use the enhanced service worker registration for the MIME type workaround
  const handleMimeTypeWorkaround = async () => {
    try {
      setLoading(true);
      toast.loading('Applying MIME type workaround...');
      
      // Update to avoid blob URLs and use direct registration with cache busting
      const swUrl = `/firebase-messaging-sw.js?v=${Date.now()}`;
      
      try {
        const registration = await navigator.serviceWorker.register(swUrl, {
          scope: '/'
        });
        
        toast.success('Service worker registered successfully with MIME type workaround');
        
        // Run diagnostics again to check the result
        await runDiagnostics();
        return registration;
      } catch (error) {
        console.error('Service worker registration failed:', error);
        toast.error(`Service worker registration failed: ${error instanceof Error ? error.message : String(error)}`);
        
        // Try loading the service worker using the loader script as a fallback
        const script = document.createElement('script');
        script.src = '/firebase-messaging-sw-loader.js';
        script.async = true;
        document.head.appendChild(script);
        
        toast.success('Trying alternative service worker loader approach');
        return null;
      }
    } catch (error) {
      console.error('MIME type workaround failed:', error);
      toast.error(`MIME type workaround failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
      toast.dismiss();
    }
  };

  // Initialize notifications for the current user
  const initialize = async () => {
    setLoading(true);
    
    try {
      // First, check if notifications are supported
      if (!('Notification' in window)) {
        toast.error('This browser does not support notifications');
        return;
      }
      
      // Check permission
      if (Notification.permission === 'denied') {
        toast.error('Notification permission has been denied. Please enable notifications in your browser settings.');
        return;
      }
      
      // Request permission if not granted
      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          toast.error('Notification permission was not granted');
          return;
        }
      }
      
      // Register service worker if needed
      if (!diagnosticsResult?.serviceWorker?.hasFCMServiceWorker) {
        console.log('Service worker not registered, attempting to register...');
        // Call registerServiceWorker and check its return value
        const registration = await registerServiceWorker();
        if (!registration) {
          toast.error('Failed to register service worker');
          setLoading(false);
          return;
        }
      }
      
      // Initialize Firebase Messaging and check its return value
      const initialized = await initializeNotifications();
      if (!initialized) {
        toast.error('Failed to initialize Firebase Messaging');
        setLoading(false);
        return;
      }
      
      // Run diagnostics to confirm everything is set up
      const diagnosticsSucceeded = await runDiagnostics();
      
      if (diagnosticsSucceeded) {
        toast.success('Notifications initialized successfully');
      } else {
        toast.error('Notifications initialized but some issues were detected. Check the diagnostic logs for details.');
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
      toast.error(`Error initializing notifications: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // Enhance the UI with more detailed diagnostics and control buttons
  return (
    <div className="flex flex-col p-4 space-y-6">
      <div className="flex flex-col space-y-4 p-4 border rounded-md">
        <h2 className="text-xl font-semibold">Notification Test Diagnostics</h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={runDiagnostics} variant="outline">
            Run Diagnostics
          </Button>
          <Button 
            onClick={registerServiceWorker} 
            variant="outline"
            className="bg-blue-50 hover:bg-blue-100"
          >
            Register Service Worker
          </Button>
          <Button 
            onClick={initialize} 
            variant="outline"
            className="bg-green-50 hover:bg-green-100"
          >
            Initialize Notifications
          </Button>
        </div>
        {diagnosticsResult && (
          <div className="mt-4 p-4 rounded-md bg-gray-50">
            <h3 className="font-semibold mb-2">Diagnostics Results:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Notifications Supported: {diagnosticsResult.notificationsSupported ? '✅' : '❌'}
              </li>
              <li>
                Service Worker Registered: {diagnosticsResult.serviceWorkerRegistered ? '✅' : '❌'}
              </li>
              <li>
                Notification Permission: {diagnosticsResult.notificationPermission}{' '}
                {diagnosticsResult.notificationPermission === 'granted' ? '✅' : '❓'}
              </li>
              <li>
                Firebase Initialized: {diagnosticsResult.firebaseInitialized ? '✅' : '❌'}
              </li>
              <li>
                Firebase Token: {diagnosticsResult.firebaseToken ? '✅' : '❌'}
              </li>
              <li>
                Cloud Functions Ping: {diagnosticsResult.cloudFunctionsPing ? '✅' : '❌'}
              </li>
            </ul>
          </div>
        )}
        
        {/* Troubleshooting steps */}
        {diagnosticsResult && getTroubleshootingSteps(diagnosticsResult)}
      </div>
      
      <div className={`p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800 ${className}`}>
        <h2 className="text-xl font-semibold mb-4">Test Push Notifications</h2>
        
        {!notificationsEnabled && (
          <div className="mb-6 p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
              <h3 className="font-medium">Notifications not enabled</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              You need to enable notifications for this browser before you can test sending them.
            </p>
            <Button 
              onClick={enableNotifications} 
              disabled={loading}
              variant="secondary"
              size="sm"
            >
              Enable Notifications
            </Button>
          </div>
        )}
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button 
                onClick={runDiagnostics} 
                disabled={loading}
                variant="outline"
                size="sm"
              >
                Run Diagnostics
              </Button>
              
              <Button 
                onClick={registerServiceWorker} 
                disabled={loading}
                variant="outline"
                size="sm"
              >
                Register Service Worker
              </Button>
              
              {token && (
                <Button 
                  onClick={forceSaveToken} 
                  disabled={loading || !currentUser}
                  variant="outline"
                  size="sm"
                  className="bg-purple-50 hover:bg-purple-100"
                >
                  Force Save Token
                </Button>
              )}
            </div>
            
            <Switch 
              id="show-tech-details"
              label="Show Technical Details"
              checked={showDiagnostics}
              onChange={(e) => setShowDiagnostics(e.target.checked)}
            />
          </div>
        
          {diagnosticsResult && showDiagnostics && (
            <div className="mt-2 mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
              <h3 className="text-sm font-medium mb-2">Diagnostics Results:</h3>
              <pre className="text-xs overflow-auto whitespace-pre-wrap">
                {JSON.stringify(diagnosticsResult, null, 2)}
              </pre>
            </div>
          )}
        
          {diagnosticsResult && (
            <div className="mt-2 mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-md text-sm">
              <h3 className="font-medium mb-2">Notification Support:</h3>
              <ul className="space-y-1">
                <li className="flex items-center">
                  <span className={diagnosticsResult.browserSupport?.notifications ? "text-green-600" : "text-red-600"}>
                    {diagnosticsResult.browserSupport?.notifications ? "✓" : "✗"}
                  </span>
                  <span className="ml-2">Notification API Support</span>
                </li>
                <li className="flex items-center">
                  <span className={diagnosticsResult.browserSupport?.serviceWorker ? "text-green-600" : "text-red-600"}>
                    {diagnosticsResult.browserSupport?.serviceWorker ? "✓" : "✗"}
                  </span>
                  <span className="ml-2">Service Worker Support</span>
                </li>
                <li className="flex items-center">
                  <span className={diagnosticsResult.notificationPermission === 'granted' ? "text-green-600" : "text-red-600"}>
                    {diagnosticsResult.notificationPermission === 'granted' ? "✓" : "✗"}
                  </span>
                  <span className="ml-2">Notification Permission ({diagnosticsResult.notificationPermission})</span>
                </li>
                <li className="flex items-center">
                  <span className={diagnosticsResult.serviceWorker?.hasFCMServiceWorker ? "text-green-600" : "text-red-600"}>
                    {diagnosticsResult.serviceWorker?.hasFCMServiceWorker ? "✓" : "✗"}
                  </span>
                  <span className="ml-2">Firebase Messaging Service Worker</span>
                </li>
              </ul>
            </div>
          )}
          
          {diagnosticsResult && (
            <div className="mt-4 mb-4">
              {getTroubleshootingSteps(diagnosticsResult)}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1">Notification Type</label>
            <Select 
              value={notificationType}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setNotificationType(e.target.value as 'user' | 'team')}
              className="w-full"
              disabled={loading}
            >
              <option value="user">User Notification</option>
              <option value="team">Team Notification</option>
            </Select>
          </div>
          
          {notificationType === 'user' ? (
            <div>
              <label className="block text-sm font-medium mb-1">User ID</label>
              <Input 
                value={userId}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setUserId(e.target.value)}
                placeholder="Enter user ID"
                className="w-full"
                disabled={loading}
              />
              {currentUser && (
                <div className="mt-1 text-xs text-gray-500">
                  Your user ID: {currentUser.id} (click to use)
                  <button 
                    onClick={() => setUserId(currentUser.id)}
                    className="ml-2 text-brand-600 hover:underline"
                  >
                    Use my ID
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1">Team ID</label>
              <Input 
                value={teamId}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setTeamId(e.target.value)}
                placeholder="Enter team ID"
                className="w-full"
                disabled={loading}
              />
              {currentUser?.teams && currentUser.teams.length > 0 && (
                <div className="mt-1 text-xs text-gray-500">
                  <span>Your teams: </span>
                  {currentUser.teams.map((team, index) => (
                    <button 
                      key={team}
                      onClick={() => setTeamId(team)}
                      className="ml-1 text-brand-600 hover:underline"
                    >
                      {team}{index < currentUser.teams.length - 1 ? ',' : ''}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1">Notification Title</label>
            <Input 
              value={title}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="Enter notification title"
              className="w-full"
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Notification Message</label>
            <Textarea 
              value={body}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value)}
              placeholder="Enter notification message"
              className="w-full"
              disabled={loading}
              rows={3}
            />
          </div>
          
          <Button 
            onClick={handleSendNotification} 
            disabled={loading || !notificationsEnabled}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Test Notification
          </Button>
        </div>
        
        {result && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Result:</h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
              <pre className="text-xs overflow-auto whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
      
      {/* Display diagnostic logs */}
      {diagnostics.length > 0 && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
          <h3 className="text-sm font-medium mb-2">Diagnostic Logs:</h3>
          <div className="max-h-60 overflow-y-auto">
            <ul className="space-y-1 text-xs font-mono">
              {diagnostics.map((message, index) => (
                <li key={index} className={message.includes('❌') ? 'text-red-500' : 
                                    message.includes('✅') ? 'text-green-500' : 
                                    message.includes('⚠️') ? 'text-yellow-500' : 'text-gray-600'}>
                  {message}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-2 flex justify-end">
            <Button 
              onClick={resetDiagnostics} 
              variant="outline" 
              size="sm"
              className="text-xs"
            >
              Clear Logs
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}; 