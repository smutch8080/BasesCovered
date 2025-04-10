import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { sendPushToUser, sendPushToTeam } from '../../services/notifications/pushNotifications';
import { registerForPushNotifications, hasNotificationsEnabled } from '../../services/notifications';
import { Bell, Send, UserPlus, Users } from 'lucide-react';
import toast from 'react-hot-toast';

interface SendNotificationDemoProps {
  teamId?: string;
  teamName?: string;
  className?: string;
}

export const SendNotificationDemo: React.FC<SendNotificationDemoProps> = ({
  teamId,
  teamName = 'Team',
  className = ''
}) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [mode, setMode] = useState<'user' | 'team'>('user');
  
  // First ensure the user has notifications enabled
  const handleEnableNotifications = async () => {
    if (!currentUser) {
      toast.error('You must be signed in to enable notifications');
      return;
    }
    
    setLoading(true);
    
    try {
      const success = await registerForPushNotifications(currentUser.id);
      
      if (success) {
        toast.success('Notifications enabled successfully!');
      } else {
        toast.error('Failed to enable notifications. Please try again.');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast.error('An error occurred while enabling notifications');
    } finally {
      setLoading(false);
    }
  };
  
  // Send notification to a specific user
  const handleSendToUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('You must be signed in to send notifications');
      return;
    }
    
    if (!title.trim() || !message.trim() || !userId.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await sendPushToUser(userId, {
        title,
        body: message,
        url: '/messaging'
      });
      
      if (result.success) {
        toast.success(`Notification sent to ${result.sent} device(s)!`);
        setTitle('');
        setMessage('');
      } else {
        toast.error(result.message || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('An error occurred while sending the notification');
    } finally {
      setLoading(false);
    }
  };
  
  // Send notification to all team members
  const handleSendToTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('You must be signed in to send notifications');
      return;
    }
    
    if (!teamId) {
      toast.error('No team selected');
      return;
    }
    
    if (!title.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await sendPushToTeam(teamId, {
        title,
        body: message,
        url: `/teams/${teamId}`
      });
      
      if (result.success) {
        toast.success(`Notification sent to ${result.sent} team member device(s)!`);
        setTitle('');
        setMessage('');
      } else {
        toast.error(result.message || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('An error occurred while sending the notification');
    } finally {
      setLoading(false);
    }
  };
  
  // Check if notifications are supported and enabled
  const notificationsSupported = typeof window !== 'undefined' && 'Notification' in window;
  const notificationsEnabled = notificationsSupported && hasNotificationsEnabled();
  
  // If notifications aren't supported, show a message
  if (!notificationsSupported) {
    return (
      <div className={`p-4 bg-gray-50 dark:bg-gray-800 rounded-lg ${className}`}>
        <p className="text-center text-gray-500 dark:text-gray-400">
          Push notifications are not supported in this browser.
        </p>
      </div>
    );
  }
  
  // If notifications aren't enabled, show enable button
  if (!notificationsEnabled) {
    return (
      <div className={`p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm ${className}`}>
        <div className="text-center">
          <Bell className="w-12 h-12 mx-auto text-brand-600 dark:text-brand-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Enable Push Notifications
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Enable notifications to receive updates about practices, games, and messages.
          </p>
          <button
            onClick={handleEnableNotifications}
            disabled={loading}
            className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Enabling...' : 'Enable Notifications'}
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm ${className}`}>
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Send Push Notification
        </h3>
        
        <div className="flex">
          <button
            onClick={() => setMode('user')}
            className={`px-3 py-1 rounded-l-md flex items-center gap-1 ${
              mode === 'user' 
                ? 'bg-brand-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span className="text-sm">User</span>
          </button>
          <button
            onClick={() => setMode('team')}
            className={`px-3 py-1 rounded-r-md flex items-center gap-1 ${
              mode === 'team' 
                ? 'bg-brand-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            disabled={!teamId}
          >
            <Users className="w-4 h-4" />
            <span className="text-sm">Team</span>
          </button>
        </div>
      </div>
      
      <form onSubmit={mode === 'user' ? handleSendToUser : handleSendToTeam} className="space-y-4">
        {mode === 'user' && (
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              User ID
            </label>
            <input
              id="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
        )}
        
        {mode === 'team' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Team
            </label>
            <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
              {teamName}
            </div>
          </div>
        )}
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notification Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter notification title"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
          />
        </div>
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter notification message"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            rows={3}
            required
          ></textarea>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Sending...' : `Send to ${mode === 'user' ? 'User' : 'Team'}`}
          </button>
        </div>
      </form>
      
      <div className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
        <p>
          {mode === 'user' 
            ? 'This will send a notification to the specified user.' 
            : `This will send a notification to all members of ${teamName}.`}
        </p>
      </div>
    </div>
  );
}; 