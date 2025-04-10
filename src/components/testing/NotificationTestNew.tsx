import React, { useState } from 'react';
import { getFCMToken, requestNotificationPermission } from '../../lib/firebase';
import { toast } from 'react-hot-toast';

const NotificationTestNew = () => {
  const [token, setToken] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(false);
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';

  // Add diagnostic message with timestamp
  const addDiagnostic = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDiagnostics(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  // Run diagnostic tests for service worker and notification setup
  const runDiagnostics = async () => {
    setStatus('loading');
    addDiagnostic('Starting diagnostics...');
    
    try {
      // Check if browser supports service workers
      if (!('serviceWorker' in navigator)) {
        addDiagnostic('❌ Service workers are not supported in this browser');
        setStatus('error');
        return;
      } else {
        addDiagnostic('✅ Service workers are supported');
      }
      
      // Check if browser supports notifications
      if (!('Notification' in window)) {
        addDiagnostic('❌ Notifications are not supported in this browser');
        setStatus('error');
        return;
      } else {
        addDiagnostic('✅ Notifications are supported');
      }
      
      // Check notification permission
      const permissionStatus = Notification.permission;
      addDiagnostic(`Current notification permission: ${permissionStatus}`);
      
      // Check for service worker registrations
      const registrations = await navigator.serviceWorker.getRegistrations();
      if (registrations.length === 0) {
        addDiagnostic('❌ No service workers are registered');
      } else {
        addDiagnostic(`✅ Found ${registrations.length} service worker registration(s):`);
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
          }
        } else {
          addDiagnostic(`❌ firebase-messaging-sw.js file not found: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        addDiagnostic(`❌ Error checking for firebase-messaging-sw.js: ${error instanceof Error ? error.message : String(error)}`);
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
      }

      setStatus('success');
      addDiagnostic('Diagnostics completed');
    } catch (error) {
      addDiagnostic(`❌ Error running diagnostics: ${error instanceof Error ? error.message : String(error)}`);
      setStatus('error');
    }
  };

  // Enable notifications for the current user
  const enableNotifications = async () => {
    setLoading(true);
    
    try {
      // First, check if notifications are already enabled
      if (Notification.permission === 'granted' && token) {
        toast.success('Notifications are already enabled');
        setLoading(false);
        return;
      }
      
      // Initialize Firebase Messaging
      const result = await initializeNotifications();
      if (result) {
        toast.success('Notifications enabled successfully');
      } else {
        toast.error('Failed to enable notifications');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast.error(`Failed to enable notifications: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // Register service worker manually
  const registerServiceWorker = async () => {
    setStatus('loading');
    addDiagnostic('Manually registering service worker loader...');
    
    try {
      // Load the service worker loader script
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
      
      // Wait for service worker to be ready
      let attempts = 0;
      const maxAttempts = 5;
      
      while (attempts < maxAttempts) {
        try {
          const registration = await navigator.serviceWorker.ready;
          addDiagnostic(`✅ Service worker is ready (scope: ${registration.scope})`);
          setStatus('success');
          return;
        } catch (err) {
          addDiagnostic(`Waiting for service worker to be ready... (${attempts + 1}/${maxAttempts})`);
          attempts++;
          
          // Wait before trying again
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      addDiagnostic('❌ Service worker did not become ready after multiple attempts');
      setStatus('error');
    } catch (error) {
      addDiagnostic(`❌ Error registering service worker: ${error instanceof Error ? error.message : String(error)}`);
      setStatus('error');
    }
  };

  // Initialize notifications and get FCM token
  const initializeNotifications = async (): Promise<string | null> => {
    setStatus('loading');
    addDiagnostic('Initializing notifications...');
    
    try {
      if (!vapidKey) {
        addDiagnostic('❌ VAPID key is not configured');
        setStatus('error');
        return null;
      }
      
      // Request notification permission
      await requestNotificationPermission();
      if (Notification.permission !== 'granted') {
        addDiagnostic('❌ Notification permission not granted');
        setStatus('error');
        return null;
      }
      
      addDiagnostic(`✅ Notification permission: ${Notification.permission}`);
      
      // Get FCM token
      addDiagnostic('Requesting FCM token...');
      const fcmToken = await getFCMToken(vapidKey);
      
      if (fcmToken) {
        setToken(fcmToken);
        addDiagnostic('✅ FCM token obtained successfully');
        
        // Send a test notification
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
          addDiagnostic(`❌ Error sending test notification: ${notifError instanceof Error ? notifError.message : String(notifError)}`);
        }
        
        setStatus('success');
        return fcmToken;
      } else {
        addDiagnostic('❌ Failed to obtain FCM token');
        setStatus('error');
        return null;
      }
    } catch (error) {
      addDiagnostic(`❌ Error initializing notifications: ${error instanceof Error ? error.message : String(error)}`);
      setStatus('error');
      return null;
    }
  };

  // Reset diagnostic state
  const resetDiagnostics = () => {
    setDiagnostics([]);
    setStatus('idle');
    setToken(null);
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Notification Testing & Diagnostics</h1>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <button 
          onClick={runDiagnostics}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={status === 'loading' || loading}
        >
          Run Diagnostics
        </button>
        
        <button 
          onClick={registerServiceWorker}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          disabled={status === 'loading' || loading}
        >
          Register Service Worker
        </button>
        
        <button 
          onClick={enableNotifications}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          disabled={status === 'loading' || loading}
        >
          Enable Notifications
        </button>
        
        <button 
          onClick={resetDiagnostics}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          disabled={status === 'loading' || loading}
        >
          Reset
        </button>
      </div>
      
      {(status === 'loading' || loading) && (
        <div className="mb-4 flex items-center">
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
          Loading...
        </div>
      )}
      
      {token && (
        <div className="mb-4 p-3 border border-green-300 rounded bg-green-50">
          <h3 className="font-bold text-green-800">FCM Token:</h3>
          <div className="mt-1 overflow-auto max-h-32 text-xs font-mono p-2 bg-white border border-green-200 rounded">
            {token}
          </div>
        </div>
      )}
      
      <div className="border rounded p-3 bg-gray-50">
        <h3 className="font-bold mb-2">Diagnostic Log:</h3>
        <div className="h-96 overflow-auto bg-black text-green-400 p-3 rounded font-mono text-sm">
          {diagnostics.length > 0 ? (
            diagnostics.map((message, i) => (
              <div key={i} className="whitespace-pre-wrap mb-1">
                {message}
              </div>
            ))
          ) : (
            <div className="text-gray-500 italic">No diagnostics yet. Click "Run Diagnostics" to start.</div>
          )}
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <h3 className="font-bold mb-1">Troubleshooting Steps:</h3>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Run diagnostics to check service worker and notification support</li>
          <li>If service worker is not registered, click "Register Service Worker"</li>
          <li>Make sure notification permissions are granted</li>
          <li>Click "Enable Notifications" to get an FCM token</li>
          <li>Check browser console for any errors</li>
        </ol>
      </div>
    </div>
  );
};

export default NotificationTestNew; 