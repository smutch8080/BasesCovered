/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkOnly, NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

// Take control immediately
clientsClaim();

// Precache all assets
precacheAndRoute(self.__WB_MANIFEST);

// Handle auth routes with NetworkOnly strategy
const authRoutes = [
  '/auth',
  '/__/auth',
  '/login',
  '/signup',
  '/auth-success',
  '/google.com',
  '/api/auth'
];

// Register auth routes to bypass cache
authRoutes.forEach(route => {
  registerRoute(
    ({ url }) => authRoutes.some(authPath => url.pathname.includes(authPath)),
    new NetworkOnly()
  );
});

// Handle all other navigation requests
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
    networkTimeoutSeconds: 3
  })
);

// Clear caches on activation
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    })
  );
});

// Skip waiting on install
self.addEventListener('install', (event: ExtendableEvent) => {
  self.skipWaiting();
});

// Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
registerRoute(
  /^https:\/\/fonts\.googleapis\.com/,
  new StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets',
  })
);

// Cache the underlying font files with a cache-first strategy for 1 year.
registerRoute(
  /^https:\/\/fonts\.gstatic\.com/,
  new CacheFirst({
    cacheName: 'google-fonts-webfonts'
  })
);

// Cache images
registerRoute(
  /\.(?:png|gif|jpg|jpeg|svg)$/,
  new CacheFirst({
    cacheName: 'images'
  })
);

// Cache API responses
registerRoute(
  /^https:\/\/firestore\.googleapis\.com/,
  new NetworkFirst({
    cacheName: 'api-cache'
  })
);

// Add offline fallback
const offlineFallbackPage = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('offline-cache').then((cache) => {
      return cache.add(offlineFallbackPage);
    })
  );
});

// Handle URL opening in PWA
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Check if this is a navigation request
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(offlineFallbackPage);
      })
    );
  }
});

// Handle messages from clients
self.addEventListener('message', async (event: ExtendableMessageEvent) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const title = data.notification.title || 'BasesCovered';
    const options = {
      body: data.notification.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      tag: data.notification.tag || 'default',
      data: data.data || {}
    };
    
    console.log('Push notification received:', data);
    
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (error) {
    console.error('Error showing notification:', error);
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  // This looks to see if the current is already open and focuses if it is
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Custom data from the notification
      const notificationData = event.notification.data;
      const url = notificationData.url || '/';
      
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open a new window if no matching client is found
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});