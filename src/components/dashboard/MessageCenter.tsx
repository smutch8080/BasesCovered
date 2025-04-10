import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { DashboardMessage } from '../../services/dashboard/types';

interface Props {
  messages: DashboardMessage[];
}

export const MessageCenter: React.FC<Props> = ({ messages = [] }) => {
  // Log component renders and message data
  useEffect(() => {
    console.log('MessageCenter rendered with messages:', messages);
  }, [messages]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-brand-primary" />
          <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
        </div>
        <Link
          to="/messages"
          className="text-sm text-brand-primary hover:opacity-90"
        >
          View All
        </Link>
      </div>

      <div className="space-y-3">
        {Array.isArray(messages) && messages.length > 0 ? (
          messages.map((message) => (
            <Link 
              key={message.id}
              to={`/messages/${message.conversationId}`}
              className={`block flex items-start gap-3 p-3 ${
                message.unread ? 'bg-brand-primary/5' : 'bg-gray-50'
              } rounded-lg hover:bg-gray-100 transition-colors`}
            >
              <MessageSquare className="w-5 h-5 text-brand-primary flex-shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="font-medium text-gray-800">
                    {message.senderName}
                  </p>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(message.createdAt, { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {message.content}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No recent messages</p>
          </div>
        )}
      </div>
    </div>
  );
};