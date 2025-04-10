// Firebase Messaging Service Worker Loader
// This script helps load the Firebase messaging service worker properly

async function loadFirebaseMessagingServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.error('Service workers are not supported in this browser');
    return null;
  }
  
  try {
    // First, check for existing registrations
    const registrations = await navigator.serviceWorker.getRegistrations();
    let hasExistingFCMSW = false;
    
    for (const registration of registrations) {
      if (registration.active?.scriptURL.includes('firebase-messaging-sw.js')) {
        console.log('Found existing Firebase messaging service worker:', registration);
        hasExistingFCMSW = true;
        
        // Instead of unregistering, we'll use the existing one if it's working
        try {
          // Test if it's responsive by sending a ping
          const messageChannel = new MessageChannel();
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Service worker ping timed out')), 1000);
          });
          
          const pingPromise = new Promise((resolve) => {
            messageChannel.port1.onmessage = (event) => {
              if (event.data && event.data.type === 'PONG') {
                resolve(true);
              }
            };
            
            registration.active.postMessage({
              type: 'PING',
              timestamp: Date.now()
            }, [messageChannel.port2]);
          });
          
          // If ping succeeds, use existing worker
          await Promise.race([pingPromise, timeoutPromise]);
          console.log('Existing Firebase messaging service worker is responsive');
          
          // Try to update the existing registration
          await registration.update();
          console.log('Existing Firebase messaging service worker updated');
          
          return registration;
        } catch (pingError) {
          console.warn('Existing service worker not responsive, will replace it:', pingError);
          await registration.unregister();
          console.log('Unregistered non-responsive Firebase messaging service worker');
        }
      }
    }
    
    // Direct registration - the most reliable approach
    console.log('Registering Firebase messaging service worker directly...');
    
    // Add cache-busting parameter to avoid caching issues
    const swUrl = `/firebase-messaging-sw.js?v=${Date.now()}`;
    
    // Register the service worker directly
    const registration = await navigator.serviceWorker.register(swUrl, { 
      scope: '/'
    });
    
    console.log('Firebase messaging service worker registered successfully:', registration);
    
    // Wait for the service worker to be activated
    if (registration.installing) {
      console.log('Service worker is installing, waiting for activation...');
      
      await new Promise((resolve) => {
        const stateChangeListener = (event) => {
          if (event.target?.state === 'activated') {
            console.log('Service worker activated');
            registration.installing?.removeEventListener('statechange', stateChangeListener);
            resolve();
          }
        };
        
        registration.installing.addEventListener('statechange', stateChangeListener);
        
        // Add a timeout to avoid hanging if activation takes too long
        setTimeout(() => {
          registration.installing?.removeEventListener('statechange', stateChangeListener);
          console.log('Service worker activation timeout - continuing anyway');
          resolve();
        }, 5000);
      });
    }
    
    return registration;
  } catch (error) {
    console.error('Failed to register Firebase messaging service worker:', error);
    return null;
  }
}

// Call the function when the page loads but after a delay to allow the main service worker to load first
window.addEventListener('load', () => {
  setTimeout(() => {
    loadFirebaseMessagingServiceWorker().catch(error => {
      console.error('Error in Firebase messaging service worker loader:', error);
    });
  }, 2000); // 2 second delay
}); 