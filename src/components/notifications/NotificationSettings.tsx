import React, { useState, useEffect } from 'react';
import { Bell, BellOff, RefreshCw } from 'lucide-react';
import { Switch } from '../../components/ui/Switch';
import { useAuth } from '../../contexts/AuthContext';
import { 
  hasNotificationsEnabled, 
  registerForPushNotifications, 
  unregisterFromPushNotifications 
} from '../../services/notifications';
import { getFCMToken } from '../../lib/firebase';
import toast from 'react-hot-toast';

interface NotificationSettingsProps {
  className?: string;
  isPushEnabled?: boolean;
  onPushToggle?: (enabled: boolean) => void;
}

// The Firebase VAPID key from your Firebase Console
const FIREBASE_VAPID_KEY = 'BCb-J3GoGZfatBeu66CmX4OxjLvEMPe3C1wKjJSaG5XkbVm7Yb3J9NoZqoNydQaITGLax2REpOztgKaAvEBay-g';

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ 
  className = '',
  isPushEnabled: externalPushEnabled,
  onPushToggle
}) => {
  const { currentUser } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(
    externalPushEnabled !== undefined ? externalPushEnabled : false
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  
  // Sync with external state if provided
  useEffect(() => {
    if (externalPushEnabled !== undefined) {
      setNotificationsEnabled(externalPushEnabled);
    }
  }, [externalPushEnabled]);
  
  // Check if notifications are enabled on mount
  useEffect(() => {
    const checkPermission = async () => {
      if (!('Notification' in window)) {
        return;
      }
      
      // If no external state is provided, use browser permission
      if (externalPushEnabled === undefined) {
        const isEnabled = hasNotificationsEnabled();
        setNotificationsEnabled(isEnabled);
      }
      
      // Try to get current token if notifications are enabled
      if (externalPushEnabled || hasNotificationsEnabled()) {
        try {
          const token = await getFCMToken(FIREBASE_VAPID_KEY);
          setCurrentToken(token);
        } catch (error) {
          console.error('Error getting FCM token:', error);
        }
      }
    };
    
    checkPermission();
  }, [externalPushEnabled]);
  
  const handleToggleNotifications = async (newValue: boolean) => {
    if (!currentUser) {
      toast.error('You must be signed in to manage notifications');
      return;
    }
    
    setLoading(true);
    
    try {
      if (newValue) {
        // Enable notifications
        const success = await registerForPushNotifications(currentUser.id);
        
        if (success) {
          setNotificationsEnabled(true);
          // Get new token
          const token = await getFCMToken(FIREBASE_VAPID_KEY);
          setCurrentToken(token);
          toast.success('Notifications enabled successfully!');
          
          // Call the callback if provided
          if (onPushToggle) {
            onPushToggle(true);
          }
        } else {
          toast.error('Failed to enable notifications. Please try again.');
        }
      } else {
        // Disable notifications
        if (currentToken) {
          const success = await unregisterFromPushNotifications(currentToken);
          
          if (success) {
            setNotificationsEnabled(false);
            setCurrentToken(null);
            toast.success('Notifications disabled successfully');
            
            // Call the callback if provided
            if (onPushToggle) {
              onPushToggle(false);
            }
          } else {
            toast.error('Failed to disable notifications. Please try again.');
          }
        } else {
          toast.error('No notification token found to disable');
        }
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      toast.error('An error occurred while managing notifications');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefreshToken = async () => {
    if (!currentUser) {
      toast.error('You must be signed in to refresh your notification token');
      return;
    }
    
    setLoading(true);
    
    try {
      const success = await registerForPushNotifications(currentUser.id);
      
      if (success) {
        // Get new token
        const token = await getFCMToken(FIREBASE_VAPID_KEY);
        setCurrentToken(token);
        toast.success('Notification token refreshed successfully!');
      } else {
        toast.error('Failed to refresh notification token');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      toast.error('An error occurred while refreshing your notification token');
    } finally {
      setLoading(false);
    }
  };
  
  // If notifications aren't supported, show a message
  if (typeof window !== 'undefined' && !('Notification' in window)) {
    return (
      <div className={`p-4 bg-gray-50 dark:bg-gray-800 rounded-lg ${className}`}>
        <div className="flex items-center gap-3">
          <BellOff className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Notifications not supported</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your browser doesn't support push notifications
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {notificationsEnabled ? (
            <Bell className="w-6 h-6 text-brand-600 dark:text-brand-400" />
          ) : (
            <BellOff className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          )}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Push Notifications</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {notificationsEnabled 
                ? 'You will receive push notifications for important updates' 
                : 'Enable push notifications to receive important updates'}
            </p>
          </div>
        </div>
        <Switch
          checked={notificationsEnabled}
          disabled={loading}
          onChange={() => !loading && handleToggleNotifications(!notificationsEnabled)}
        />
      </div>

      {notificationsEnabled && (
        <>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Notification token status
              </p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Active
              </span>
            </div>
            
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleRefreshToken}
                disabled={loading}
                className="inline-flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300"
              >
                <RefreshCw className="w-4 h-4" />
                {loading ? 'Refreshing token...' : 'Refresh token'}
              </button>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p><strong>Note:</strong> You can revoke notification permissions at any time through your browser settings.</p>
          </div>
        </>
      )}
    </div>
  );
}; 