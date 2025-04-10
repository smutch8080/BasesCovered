import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const InstallPrompt: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOSStandalone, setIsIOSStandalone] = useState(false);

  useEffect(() => {
    // Check if it's iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone;

    // Only show for iOS devices that haven't installed the app
    setIsIOSStandalone(isStandalone);
    setIsVisible(isIOS && !isStandalone);

    // Store in localStorage if user has dismissed
    const hasUserDismissed = localStorage.getItem('installPromptDismissed');
    if (hasUserDismissed) {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  if (!isVisible || isIOSStandalone) return null;

  return (
    <div className="fixed bottom-16 left-4 right-4 bg-brand-primary text-white rounded-lg shadow-lg p-4 z-50 md:hidden">
      <button 
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-2 text-white/80 hover:text-white"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <img
            src="/assets/bases-covered-white-logo.png"
            alt="BasesCovered App Icon"
            className="w-12 h-12 rounded-xl shadow-lg"
          />
        </div>
        <div>
          <h3 className="font-medium text-white mb-1">
            Add to Home Screen
          </h3>
          <p className="text-sm text-white/90">
            Install BasesCovered for the best experience! Tap
            <span className="inline-block mx-1">
              <svg 
                xmlns="http://www.w3.org/2000/svg"
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="w-4 h-4 inline"
              >
                <path d="M12 2v7" />
                <path d="M9 5l3-3 3 3" />
                <path d="M19 9v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9" />
              </svg>
            </span>
            and choose "Add to Home Screen"
          </p>
        </div>
      </div>
    </div>
  );
};