import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './lib/firebase';

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');

const root = createRoot(container);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Load the service worker loader script
if ('serviceWorker' in navigator) {
  // Create a script element to load our service worker loader
  const script = document.createElement('script');
  script.src = '/service-worker-loader.js';
  script.async = true;
  script.defer = true;
  script.onerror = (error) => {
    console.error('Error loading service worker loader:', error);
  };
  document.head.appendChild(script);
  console.log('Service worker loader script added to page');
}