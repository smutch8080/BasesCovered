import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutList, Users, Calendar, MoreHorizontal, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const MobileMenu = () => {
  const location = useLocation();
  const { currentUser } = useAuth();

  // Don't show menu on landing page for non-authenticated users
  if (!currentUser && location.pathname === '/') {
    return null;
  }

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden pb-safe pb-6">
      <div className="flex justify-around items-center h-16">
        <Link 
          to="/"
          className={`flex flex-col items-center justify-center flex-1 py-2 ${
            isActive('/') ? 'text-brand-primary' : 'text-gray-600'
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>

        <Link 
          to="/feed"
          className={`flex flex-col items-center justify-center flex-1 py-2 ${
            isActive('/feed') ? 'text-brand-primary' : 'text-gray-600'
          }`}
        >
          <Bell className="w-6 h-6" />
          <span className="text-xs mt-1">Feed</span>
        </Link>

        <Link 
          to="/teams"
          className={`flex flex-col items-center justify-center flex-1 py-2 ${
            isActive('/teams') ? 'text-brand-primary' : 'text-gray-600'
          }`}
        >
          <Users className="w-6 h-6" />
          <span className="text-xs mt-1">Teams</span>
        </Link>

        <Link 
          to="/events"
          className={`flex flex-col items-center justify-center flex-1 py-2 ${
            isActive('/events') ? 'text-brand-primary' : 'text-gray-600'
          }`}
        >
          <Calendar className="w-6 h-6" />
          <span className="text-xs mt-1">Events</span>
        </Link>

        <Link 
          to="/more"
          className={`flex flex-col items-center justify-center flex-1 py-2 ${
            isActive('/more') ? 'text-brand-primary' : 'text-gray-600'
          }`}
        >
          <MoreHorizontal className="w-6 h-6" />
          <span className="text-xs mt-1">More</span>
        </Link>
      </div>
    </div>
  );
};