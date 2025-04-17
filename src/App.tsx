import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from './contexts/AuthContext';
import { DebugProvider } from './contexts/DebugContext';
import { HelpProvider } from './components/help/HelpProvider';
import { MessagingProvider } from './contexts/MessagingContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { MobileMenu } from './components/mobile/MobileMenu';
import { InstallPrompt } from './components/mobile/InstallPrompt';
import { NotificationPermissionRequest } from './components/notifications/NotificationPermissionRequest';
import { listenForForegroundMessages } from './services/notifications';
import Routes from './Routes';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import toast from 'react-hot-toast';

export default function App() {
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Set up authentication listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log(
        `🔐 Auth state changed: ${user ? 'Authenticated' : 'Not authenticated'}`,
        user ? {
          uid: user.uid,
          email: user.email,
          phoneNumber: user.phoneNumber,
          emailVerified: user.emailVerified,
          displayName: user.displayName,
          photoURL: user.photoURL,
          providerData: user.providerData.map(p => ({
            providerId: p.providerId,
            uid: p.uid,
            displayName: p.displayName,
            email: p.email,
            phoneNumber: p.phoneNumber
          }))
        } : 'No user'
      );
      
      setIsAuthenticated(!!user);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Check notification permission and show prompt if needed
  useEffect(() => {
    if (isAuthenticated && typeof window !== 'undefined' && 'Notification' in window) {
      // Only show the prompt if the user hasn't made a decision yet
      if (Notification.permission === 'default') {
        // Wait a bit before showing the prompt
        const timer = setTimeout(() => {
          setShowNotificationPrompt(true);
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated]);
  
  // Set up notification listener for foreground messages
  useEffect(() => {
    if (isAuthenticated && Notification.permission === 'granted') {
      const unsubscribe = listenForForegroundMessages((payload) => {
        // You can customize how foreground notifications appear
        if (payload.notification) {
          toast.custom((t) => (
            <div 
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex`}
            >
              <div className="flex-1 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <img 
                      className="h-10 w-10 rounded-full"
                      src="/icons/icon-72.png"
                      alt="BasesCovered"
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {payload.notification.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {payload.notification.body}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-brand-600 hover:text-brand-500 focus:outline-none"
                >
                  Close
                </button>
              </div>
            </div>
          ), { duration: 8000 });
        }
      });
      
      return () => unsubscribe();
    }
  }, [isAuthenticated]);

  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Router>
          <AuthProvider>
            <DebugProvider>
              <HelpProvider>
                <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
                  <Header />
                  <main className="flex-1 overflow-auto">
                    <MessagingProvider>
                      {showNotificationPrompt && (
                        <div className="container mx-auto px-4 my-4">
                          <NotificationPermissionRequest 
                            variant="banner"
                            className="animate-fade-in"
                          />
                        </div>
                      )}
                      <Routes />
                    </MessagingProvider>
                  </main>
                  <MobileMenu />
                  <InstallPrompt />
                </div>
              </HelpProvider>
            </DebugProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}