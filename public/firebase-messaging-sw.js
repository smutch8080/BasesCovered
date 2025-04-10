// Firebase Cloud Messaging Service Worker
// This file must be in the public directory for FCM to work properly

// Add self-contained error handling
self.addEventListener('error', function(event) {
  console.error('[firebase-messaging-sw.js] Error occurred:', event.error);
});

try {
  // Instead of importing Firebase from CDN which may be blocked by CSP, 
  // we'll use a minimal inline implementation focused on messaging only
  
  console.log('[firebase-messaging-sw.js] Initializing service worker with inline Firebase implementation');
  
  // Activate immediately to ensure we're handling notifications
  self.addEventListener('install', function(event) {
    console.log('[firebase-messaging-sw.js] Service worker installed');
    event.waitUntil(self.skipWaiting());
  });
  
  self.addEventListener('activate', function(event) {
    console.log('[firebase-messaging-sw.js] Service worker activated');
    event.waitUntil(clients.claim());
  });
  
  // Minimal Firebase implementation for messaging only
  self.firebase = {
    initializeApp: function(config) {
      this.config = config;
      console.log('[firebase-messaging-sw.js] Firebase initialized with sender ID:', config.messagingSenderId);
      return {
        messaging: function() {
          return self.firebase.messaging;
        }
      };
    },
    messaging: {
      onBackgroundMessage: function(callback) {
        self.addEventListener('push', function(event) {
          if (!event.data) return;
          
          try {
            var payload = event.data.json();
            console.log('[firebase-messaging-sw.js] Push event received:', payload);
            
            // Call user callback with payload
            callback(payload);
          } catch (error) {
            console.error('[firebase-messaging-sw.js] Error processing push event:', error);
            
            // Try to extract text data as fallback
            try {
              const text = event.data.text();
              console.log('[firebase-messaging-sw.js] Push event text data:', text);
              
              try {
                // Try to parse as JSON
                const jsonData = JSON.parse(text);
                callback(jsonData);
              } catch (parseError) {
                // Show a basic notification with the text
                event.waitUntil(
                  self.registration.showNotification('New Message', {
                    body: text,
                    icon: '/icons/icon-192.png',
                    badge: '/icons/icon-72.png',
                    vibrate: [200, 100, 200],
                    requireInteraction: true
                  })
                );
              }
            } catch (textError) {
              console.error('[firebase-messaging-sw.js] Error extracting text data:', textError);
              
              // Last resort - show a generic notification
              event.waitUntil(
                self.registration.showNotification('New Notification', {
                  body: 'You have a new notification',
                  icon: '/icons/icon-192.png',
                  badge: '/icons/icon-72.png',
                  vibrate: [200, 100, 200],
                  requireInteraction: true
                })
              );
            }
          }
        });
      }
    }
  };
  
  // Initialize Firebase with config
  self.firebase.initializeApp({
    apiKey: "AIzaSyCE_7cUXA9NYAr8tc0Jgs2KoX2cYbEISsg",
    authDomain: "softball-practice-planner.firebaseapp.com",
    projectId: "softball-practice-planner",
    storageBucket: "softball-practice-planner.firebasestorage.app",
    messagingSenderId: "182231500377",
    appId: "1:182231500377:web:0bd50635799a23dc0c1348"
  });

  var messaging = self.firebase.messaging;
  
  // Handle background messages
  messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);
    
    try {
      var notificationTitle = 'BasesCovered';
      if (payload.notification && payload.notification.title) {
        notificationTitle = payload.notification.title;
      }
      
      var notificationBody = '';
      if (payload.notification && payload.notification.body) {
        notificationBody = payload.notification.body;
      }
      
      var notificationTag = 'default';
      if (payload.notification && payload.notification.tag) {
        notificationTag = payload.notification.tag;
      }
      
      var notificationData = {};
      if (payload.data) {
        notificationData = payload.data;
      }
      
      var notificationOptions = {
        body: notificationBody,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-72.png',
        tag: notificationTag,
        data: notificationData,
        // Add vibration pattern to increase notification visibility
        vibrate: [200, 100, 200, 200, 200],
        // Ensure the notification requires interaction on mobile
        requireInteraction: true,
        // Ensure notification shows in foreground on Mac OS and other platforms
        silent: false
      };
      
      console.log('[firebase-messaging-sw.js] Showing notification:', {
        title: notificationTitle,
        options: notificationOptions
      });
      
      // Prevent notification from being swallowed by returning the promise
      return self.registration.showNotification(notificationTitle, notificationOptions);
    } catch (notificationError) {
      console.error('[firebase-messaging-sw.js] Error showing notification:', notificationError);
    }
  });

  // Handle direct push events as well
  self.addEventListener('push', function(event) {
    // This handler will be called if the FCM handler didn't process it
    if (!event.handled) {
      console.log('[firebase-messaging-sw.js] Push event received directly');
      
      if (!event.data) return;
      
      try {
        var data = event.data.json();
        console.log('[firebase-messaging-sw.js] Push data:', data);
        
        var title = 'BasesCovered';
        var options = {
          body: 'You have a new notification',
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-72.png',
          vibrate: [200, 100, 200, 200, 200],
          requireInteraction: true,
          silent: false,
          data: {}
        };
        
        if (data.notification) {
          if (data.notification.title) title = data.notification.title;
          if (data.notification.body) options.body = data.notification.body;
        }
        
        if (data.data) {
          options.data = data.data;
        }
        
        console.log('[firebase-messaging-sw.js] Showing direct notification:', {
          title: title,
          options: options
        });
        
        // Ensure the event doesn't complete before showing notification
        event.waitUntil(
          self.registration.showNotification(title, options)
        );
        
        // Mark as handled to prevent duplicate processing
        event.handled = true;
      } catch (error) {
        console.error('[firebase-messaging-sw.js] Error processing direct push event:', error);
        
        // Try to extract text data as fallback
        try {
          const text = event.data.text();
          console.log('[firebase-messaging-sw.js] Push event text data:', text);
          
          // Show a basic notification with the text
          event.waitUntil(
            self.registration.showNotification('New Message', {
              body: text,
              icon: '/icons/icon-192.png',
              badge: '/icons/icon-72.png',
              vibrate: [200, 100, 200],
              requireInteraction: true
            })
          );
        } catch (textError) {
          console.error('[firebase-messaging-sw.js] Error extracting text data:', textError);
        }
      }
    }
  });

  // Handle notification click
  self.addEventListener('notificationclick', function(event) {
    console.log('[firebase-messaging-sw.js] Notification clicked:', event);
    
    // Close the notification when clicked
    event.notification.close();
    
    // Determine URL to open
    var urlToOpen = '/';
    
    // Try to get URL from notification data
    if (event.notification.data) {
      if (event.notification.data.url) {
        urlToOpen = event.notification.data.url;
        console.log('[firebase-messaging-sw.js] Using URL from notification data:', urlToOpen);
      } else if (event.notification.data.FCM_MSG && event.notification.data.FCM_MSG.data && event.notification.data.FCM_MSG.data.url) {
        // Handle nested FCM message structure
        urlToOpen = event.notification.data.FCM_MSG.data.url;
        console.log('[firebase-messaging-sw.js] Using URL from FCM_MSG data:', urlToOpen);
      }
    }
    
    console.log('[firebase-messaging-sw.js] Opening URL:', urlToOpen);
    
    // This looks to see if the current is already open and focuses if it is
    event.waitUntil(
      clients.matchAll({ 
        type: 'window', 
        includeUncontrolled: true 
      }).then(function(windowClients) {
        // Check if there is already a window/tab open with the target URL
        var matchingClient = null;
        
        for (var i = 0; i < windowClients.length; i++) {
          var client = windowClients[i];
          // If so, just focus it.
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            matchingClient = client;
            break;
          }
        }
        
        // If we found a matching client, focus it
        if (matchingClient) {
          console.log('[firebase-messaging-sw.js] Focusing existing window for URL:', urlToOpen);
          return matchingClient.focus();
        }
        
        // If there's any client at all, navigate the first one
        if (windowClients.length > 0 && 'navigate' in windowClients[0]) {
          console.log('[firebase-messaging-sw.js] Navigating existing window to URL:', urlToOpen);
          return windowClients[0].navigate(urlToOpen).then(function(client) {
            return client.focus();
          });
        }
        
        // If not, open a new window/tab
        if (clients.openWindow) {
          console.log('[firebase-messaging-sw.js] Opening new window for URL:', urlToOpen);
          return clients.openWindow(urlToOpen);
        }
      }).catch(function(error) {
        console.error('[firebase-messaging-sw.js] Error handling notification click:', error);
      })
    );
  });

  // Listen for message events and send responses
  self.addEventListener('message', function(event) {
    console.log('[firebase-messaging-sw.js] Service worker received message:', event.data);
    
    // Handle ping messages to test if the service worker is alive
    if (event.data && event.data.type === 'PING') {
      console.log('[firebase-messaging-sw.js] Received PING, sending PONG response');
      // Make sure to use the same port that was sent to reply
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ 
          type: 'PONG', 
          timestamp: new Date().getTime() 
        });
      }
    }
  });

  console.log('[firebase-messaging-sw.js] Service worker successfully loaded');
} catch (error) {
  console.error('[firebase-messaging-sw.js] Failed to initialize:', error);
} 