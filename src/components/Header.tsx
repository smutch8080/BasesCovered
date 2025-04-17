import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { User, MessageCircle, Bot, MenuIcon, ChevronDown, FolderOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { NavigationMenu } from './navigation/NavigationMenu';
import { ThemeToggle } from './ThemeToggle';
import { collection, query, where, getDocs, orderBy, limit, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const Header: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Check if we're on a public page where we want to show the landing menu
  const isPublicPage = [
    '/',
    '/private-training',
    '/bases-covered-clinics',
    '/summer-team',
    '/about',
    '/contact',
    '/auth'
  ].includes(location.pathname) || location.pathname.startsWith('/auth');

  useEffect(() => {
    if (!currentUser) {
      // Clear any previous unread counts if user is not authenticated
      setUnreadCount(0);
      return;
    }

    // Track unread messages across conversations and team chats
    const unsubscribers: (() => void)[] = [];

    const setupMessageTracking = async () => {
      try {
        // Track direct conversations
        const conversationsRef = collection(db, 'conversations');
        const conversationsQuery = query(
          conversationsRef,
          where('participants', 'array-contains', currentUser.id),
          orderBy('updatedAt', 'desc'),
          limit(50)
        );

        const conversationsUnsubscribe = onSnapshot(conversationsQuery, (snapshot) => {
          let totalUnread = 0;
          
          snapshot.forEach(doc => {
            const data = doc.data();
            // Check if the last message is from someone else and not read by current user
            if (data.lastMessage && data.lastMessage.senderId !== currentUser.id) {
              const isRead = data.lastMessage.readBy && 
                             Array.isArray(data.lastMessage.readBy) && 
                             data.lastMessage.readBy.includes(currentUser.id);
              
              if (!isRead) {
                totalUnread += 1;
              }
            }
          });
          
          setUnreadCount(totalUnread);
          console.log('Updated unread count:', totalUnread);
        }, (error) => {
          console.error('Error tracking messages:', error);
        });

        unsubscribers.push(conversationsUnsubscribe);
        
        // Also track unread counts from the unread_counts collection
        const unreadCountsRef = collection(db, 'unread_counts');
        const unreadCountsQuery = query(
          unreadCountsRef,
          where('userId', '==', currentUser.id)
        );
        
        const unreadCountsUnsubscribe = onSnapshot(unreadCountsQuery, (snapshot) => {
          let totalFromCounts = 0;
          
          snapshot.forEach(doc => {
            const data = doc.data();
            totalFromCounts += data.count || 0;
          });
          
          if (totalFromCounts > 0) {
            setUnreadCount(prev => Math.max(prev, totalFromCounts));
            console.log('Updated unread count from unread_counts:', totalFromCounts);
          }
        }, (error) => {
          console.error('Error tracking unread counts:', error);
        });
        
        unsubscribers.push(unreadCountsUnsubscribe);
      } catch (error) {
        console.error('Error setting up message tracking:', error);
      }
    };

    setupMessageTracking();

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [currentUser]);

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm relative z-[100]">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Show hamburger menu button only when appropriate */}
            {(!isPublicPage || currentUser) && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Toggle menu"
              >
                <MenuIcon className="w-6 h-6" />
              </button>
            )}
            <Link to="/" className="flex items-center">
              <img 
                src="/assets/logo.svg" 
                alt="Bases Covered" 
                className="h-12 dark:invert"
              />
            </Link>
          </div>

          {/* Main Navigation - Only visible on public pages when not logged in */}
          {isPublicPage && !currentUser && (
            <div className="hidden md:flex items-center gap-6">
              <Link 
                to="/private-training" 
                className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 font-medium"
              >
                Private Training
              </Link>
              <Link 
                to="/bases-covered-clinics" 
                className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 font-medium"
              >
                BasesCovered Clinics
              </Link>
              <Link 
                to="/summer-team" 
                className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 font-medium"
              >
                Summer Practice Teams
              </Link>
            </div>
          )}

          {/* Right Side Navigation */}
          <div className="flex items-center gap-4">
           
            {currentUser ? (
              <>
               <ThemeToggle />
                <Link
                  to="/coaching-assistant"
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                  title="AI Coaching Assistant"
                >
                  <Bot className="w-6 h-6" />
                </Link>
                <Link
                  to="/messaging"
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors relative"
                >
                  <MessageCircle className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center 
                      bg-brand-accent text-white text-xs font-bold rounded-full px-1">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center gap-2 hover:opacity-80">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                      {currentUser.profilePicture ? (
                        <img 
                          src={currentUser.profilePicture} 
                          alt={currentUser.displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                  </Menu.Button>

                  <Transition
                    enter="transition duration-100 ease-out"
                    enterFrom="transform scale-95 opacity-0"
                    enterTo="transform scale-100 opacity-100"
                    leave="transition duration-75 ease-out"
                    leaveFrom="transform scale-100 opacity-100"
                    leaveTo="transform scale-95 opacity-0"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-64 origin-top-right bg-white dark:bg-gray-800 rounded-lg 
                      shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100 dark:divide-gray-700 z-[200]">
                      {/* Profile Info */}
                      <div className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{currentUser.displayName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser.email}</p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/profile"
                              className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                            >
                              Profile Settings
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={signOut}
                              className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                            >
                              Sign Out
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/auth?mode=signin"
                  className="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?mode=register"
                  className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Authenticated Navigation Menu */}
        {currentUser && (
          <NavigationMenu 
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
        )}

        {/* Mobile Menu */}
        <div
          className={`md:hidden fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 transform transition-transform duration-300 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            {/* Mobile menu content */}
            <div className="p-4 space-y-4">
              {/* Show landing page links only when appropriate */}
              {isPublicPage && !currentUser && (
                <>
                  <Link 
                    to="/private-training" 
                    className="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Private Training
                  </Link>
                  <Link 
                    to="/bases-covered-clinics" 
                    className="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    BasesCovered Clinics
                  </Link>
                  <Link 
                    to="/summer-team" 
                    className="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Summer Practice Teams
                  </Link>
                </>
              )}
              
              {/* Show authenticated menu when logged in */}
              {currentUser && (
                <NavigationMenu 
                  isMobileMenuOpen={isMobileMenuOpen} 
                  setIsMobileMenuOpen={setIsMobileMenuOpen} 
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};