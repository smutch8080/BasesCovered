import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Calendar, BookOpen, FileText, Award, 
  GraduationCap, Grid, Music, Target, HandHelping,
  MessageSquare, Settings, User, FolderOpen, Bell,
  Shield, Database, HelpCircle, GitPullRequest
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface MenuItem {
  to: string;
  icon: LucideIcon;
  label: string;
  coachOnly?: boolean;
}

interface MenuSection {
  title: string;
  adminOnly?: boolean;
  items: MenuItem[];
}

function MorePage() {
  const { currentUser } = useAuth();
  const isCoach = currentUser?.role === 'coach' || currentUser?.role === 'admin';
  const isAdmin = currentUser?.role === 'admin';

  const menuItems: MenuSection[] = [
    {
      title: 'Quick Actions',
      items: [
        { to: '/practice-plan/new', icon: FileText, label: 'Create Practice Plan', coachOnly: true },
        { to: '/homework/new', icon: BookOpen, label: 'Assign Homework', coachOnly: true },
        { to: '/messages', icon: MessageSquare, label: 'Messages' },
        { to: '/volunteers', icon: HandHelping, label: 'Volunteer', coachOnly: false },
      ]
    },
    {
      title: 'Training & Development',
      items: [
        { to: '/coaches-university', icon: GraduationCap, label: 'Coaches University', coachOnly: true },
        { to: '/drills', icon: Target, label: 'Drill Library' },
        { to: '/scenarios', icon: Target, label: 'Game Scenarios' },
        { to: '/collections', icon: FolderOpen, label: 'Collections' },
      ]
    },
    {
      title: 'Team Resources',
      items: [
        { to: '/saved-plans', icon: FileText, label: 'Practice Plans' },
        { to: '/homework', icon: BookOpen, label: 'Homework' },
        { to: '/progress', icon: Award, label: 'Progress Reports' },
        { to: '/chants', icon: Music, label: 'Team Cheers' },
      ]
    },
    {
      title: 'Account',
      items: [
        { to: '/profile', icon: User, label: 'Profile Settings' },
        { to: '/settings', icon: Settings, label: 'App Settings' },
      ]
    },
    {
      title: 'Administration',
      adminOnly: true,
      items: [
        { to: '/admin/users', icon: Users, label: 'User Management' },
        { to: '/admin/help-articles', icon: HelpCircle, label: 'Help Articles' },
        { to: '/admin/cta', icon: GitPullRequest, label: 'CTA Management' },
        { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
      ]
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      {/* User Profile Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            {currentUser?.profilePicture ? (
              <img 
                src={currentUser.profilePicture} 
                alt={currentUser.displayName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{currentUser?.displayName}</h2>
            <p className="text-gray-600">{currentUser?.role}</p>
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="space-y-8">
        {menuItems.map((section, index) => {
          // Skip admin sections for non-admins
          if (section.adminOnly && !isAdmin) return null;
          
          const filteredItems = section.items.filter(item => 
            !item.coachOnly || (item.coachOnly && isCoach)
          );

          if (filteredItems.length === 0) return null;

          return (
            <div key={index}>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {section.title}
                {section.adminOnly && (
                  <Shield className="inline-block ml-2 w-4 h-4 text-purple-500" />
                )}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {filteredItems.map((item, itemIndex) => (
                  <Link
                    key={itemIndex}
                    to={item.to}
                    className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <item.icon className="w-6 h-6 text-brand-primary" />
                    <span className="font-medium text-gray-800">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MorePage;