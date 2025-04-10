import React from 'react';
import { NotificationTest } from '../components/testing/NotificationTest';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const TestNotificationsPage: React.FC = () => {
  const { currentUser } = useAuth();

  // Redirect if user is not logged in
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Push Notification Testing</h1>
      <p className="mb-6 text-gray-600 dark:text-gray-300">
        This page allows you to test push notifications for the BasesCovered application.
        You can send test notifications to individual users or entire teams.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <NotificationTest className="h-full" />
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-lg">1. Enable Notifications</h3>
              <p className="text-gray-600 dark:text-gray-300">
                You must first enable notifications by clicking the "Enable Notifications" button.
                This will request permission and register your device for push notifications.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-lg">2. Select Notification Target</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Choose whether to send a notification to an individual user or to all members of a team.
                Enter the appropriate ID in the field provided.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-lg">3. Compose Your Message</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Enter a title and message for your test notification. These will be displayed
                in the push notification that is sent.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-lg">4. Send and Check Results</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Click the "Send Test Notification" button to send your message. The results
                will be displayed below, showing success or any errors that occurred.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestNotificationsPage; 