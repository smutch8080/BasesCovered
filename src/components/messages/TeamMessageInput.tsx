import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface Props {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const TeamMessageInput: React.FC<Props> = ({ 
  onSendMessage, 
  isLoading = false,
  placeholder = "Type a message..."
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white">
      <div className="flex flex-col gap-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-primary resize-none"
          disabled={isLoading}
          rows={6}
          style={{ minHeight: '150px' }}
        />
        
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className="self-end px-6 py-2 bg-brand-primary text-white rounded-lg 
            hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          {isLoading ? 'Sending...' : 'Send Message'}
        </button>
      </div>
    </form>
  );
};