import React from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Button } from '../ui';

interface TestNotificationsButtonProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const TestNotificationsButton: React.FC<TestNotificationsButtonProps> = ({
  className = '',
  size = 'md',
  showText = true
}) => {
  return (
    <Link to="/test-notifications" className="inline-block">
      <Button
        variant="secondary"
        size={size}
        className={`flex items-center ${className}`}
      >
        <Bell className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} ${showText ? 'mr-2' : ''}`} />
        {showText && 'Test Notifications'}
      </Button>
    </Link>
  );
}; 