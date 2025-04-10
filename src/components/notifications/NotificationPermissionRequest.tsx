import React, { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { registerForPushNotifications, hasNotificationsEnabled } from '../../services/notifications';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface NotificationPermissionRequestProps {
  variant?: 'banner' | 'inline' | 'button';
  className?: string;
}

export const NotificationPermissionRequest: React.FC<NotificationPermissionRequestProps> = ({
  variant = 'banner',
  className = ''
}) => {
  const { currentUser } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Check if notifications are enabled on mount
  useEffect(() => {
    const checkPermission = () => {
      if (!('Notification' in window)) {
        setNotificationsEnabled(false);
        return;
      }
      
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
      } else if (Notification.permission === 'denied') {
        setNotificationsEnabled(false);
      } else {
        setNotificationsEnabled(null);
      }
    };
    
    checkPermission();
  }, []);
  
  const handleEnableNotifications = async () => {
    if (!currentUser) {
      toast.error('Please sign in to enable notifications');
      return;
    }
    
    setLoading(true);
    
    try {
      const success = await registerForPushNotifications(currentUser.id);
      
      if (success) {
        setNotificationsEnabled(true);
        toast.success('Notifications enabled successfully!');
      } else {
        setNotificationsEnabled(false);
        toast.error('Failed to enable notifications. Please try again.');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast.error('An error occurred while enabling notifications');
    } finally {
      setLoading(false);
    }
  };
  
  // If notifications aren't supported, don't render anything
  if (typeof window !== 'undefined' && !('Notification' in window)) {
    return null;
  }
  
  // If notifications are already enabled, don't show the request
  if (notificationsEnabled === true) {
    return null;
  }
  
  // Render different variants
  if (variant === 'banner') {
    return (
      <div className={`bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 rounded-lg p-4 flex items-center justify-between ${className}`}>
        <div className="flex items-center gap-3">
          <div className="bg-brand-100 dark:bg-brand-800 rounded-full p-2">
            <Bell className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h3 className="font-medium text-brand-900 dark:text-brand-50">Enable notifications</h3>
            <p className="text-sm text-brand-600 dark:text-brand-300">
              Get alerts for practices, games, and team updates
            </p>
          </div>
        </div>
        <button
          onClick={handleEnableNotifications}
          disabled={loading}
          className="px-4 py-2 bg-brand-600 text-brand-primary rounded-md hover:bg-brand-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Enabling...' : 'Enable'}
        </button>
      </div>
    );
  }
  
  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Bell className="w-4 h-4 text-brand-600 dark:text-brand-400" />
        <span className="text-sm">Want to receive notifications?</span>
        <button
          onClick={handleEnableNotifications}
          disabled={loading}
          className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline"
        >
          {loading ? 'Enabling...' : 'Enable now'}
        </button>
      </div>
    );
  }
  
  // Button variant (default)
  return (
    <button
      onClick={handleEnableNotifications}
      disabled={loading}
      className={`flex items-center gap-2 px-3 py-2 bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 rounded-md hover:bg-brand-100 dark:hover:bg-brand-800/30 transition-colors ${className}`}
    >
      <Bell className="w-4 h-4 text-brand-600 dark:text-brand-400" />
      <span className="text-sm font-medium text-brand-700 dark:text-brand-300">
        {loading ? 'Enabling notifications...' : 'Enable notifications'}
      </span>
    </button>
  );
}; 