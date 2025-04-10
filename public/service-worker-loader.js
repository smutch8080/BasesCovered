// Service Worker Loader
// This script helps load the service worker properly

async function loadServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.error('Service workers are not supported in this browser');
    return;
  }

  try {
    // Check for existing service worker registrations
    const registrations = await navigator.serviceWorker.getRegistrations();
    let hasExistingServiceWorker = false;
    
    for (const registration of registrations) {
      if (registration.active?.scriptURL.includes('service-worker.js') && 
          !registration.active.scriptURL.includes('firebase-messaging-sw.js')) {
        console.log('Found existing service worker:', registration);
        hasExistingServiceWorker = true;
        
        // If it's already registered and active, we'll use it
        if (registration.active.state === 'activated') {
          console.log('Existing service worker is already activated');
          return registration;
        }
        
        // Otherwise unregister and register a new one
        await registration.unregister();
        console.log('Unregistered existing service worker to register a new one');
      }
    }
    
    // Simply register the service worker directly with cache busting
    console.log('Registering service worker...');
    const swUrl = `/service-worker.js?v=${Date.now()}`;
    
    const registration = await navigator.serviceWorker.register(swUrl, { 
      scope: '/' 
    });
    
    console.log('Service worker registered successfully:', registration);
    return registration;
  } catch (error) {
    console.error('Failed to register service worker:', error);
    throw error;
  }
}

// Call the function when the page loads
window.addEventListener('load', () => {
  loadServiceWorker().catch(error => {
    console.error('Error in service worker loader:', error);
  });
}); 