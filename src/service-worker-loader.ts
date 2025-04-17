// Service Worker Loader
// This script handles registration and updates of the service worker

export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service workers are not supported');
    return;
  }

  try {
    console.log('Registering service worker...');
    
    // Get the current protocol and port
    const protocol = window.location.protocol;
    const port = window.location.port;
    const swPath = `${protocol}//${window.location.hostname}${port ? ':' + port : ''}/service-worker.js`;
    
    console.log('Registering service worker at:', swPath);
    const registration = await navigator.serviceWorker.register(swPath, {
      scope: '/',
      type: 'module'
    });

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'activated') {
          console.log('New service worker activated');
        }
      });
    });

    console.log('Service worker registered successfully:', registration);
    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    throw error;
  }
};

// Handle controller changes
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('New service worker controlling page');
  });
}

// Unregister all service workers
export const unregisterServiceWorkers = async () => {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations.map(registration => {
        console.log('Unregistering service worker:', registration.scope);
        return registration.unregister();
      })
    );
  } catch (error) {
    console.error('Error unregistering service workers:', error);
  }
};

// Handle service worker messages
navigator.serviceWorker?.addEventListener('message', (event) => {
  if (event.data.type === 'AUTH_STATE_CHANGED') {
    // Broadcast auth state change to all tabs/windows
    window.dispatchEvent(new CustomEvent('auth-state-changed', {
      detail: event.data.user
    }));
  }
}); 