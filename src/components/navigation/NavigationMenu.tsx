import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { 
  LayoutDashboard, Users, Calendar, BookOpen, FileText,
  BarChart2, Award, Grid, GraduationCap, UserCircle, Briefcase, Star,
  Music, ChevronDown, MenuIcon, ListTodo, Target, HandHelping, FolderOpen,
  Bell, Trophy
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const NavigationMenu: React.FC<Props> = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { currentUser } = useAuth();
  const { teamId } = useParams();
  const defaultTeamId = currentUser?.teams?.[0];

  // Only show team resources if user has teams
  const resourcesItems = [
    { to: '/field-visualizer', icon: Music, label: 'Field Visualizer' },
    { to: '/coaches-university', icon: GraduationCap, label: 'Coaches University' },
    { to: '/collections', icon: Grid, label: 'Collections' },
    ...(defaultTeamId ? [
      { to: `/teams/${defaultTeamId}/resources`, icon: FolderOpen, label: 'Team Resources' }
    ] : []),
     { to: '/chants', icon: Music, label: 'Cheers' },
  ];

  const mainMenu = [
    {
      label: 'Feed',
      icon: Bell,
      to: '/feed'
    },
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      to: '/'
    },
    {
      label: 'Teams & Activities',
      icon: Users,
      items: [
        { to: '/teams', icon: Users, label: 'My Teams' },
        { to: '/games', icon: Trophy, label: 'Games' },
        { to: '/events', icon: Calendar, label: 'Events' },
        { to: '/volunteers', icon: HandHelping, label: 'Volunteers' },
        { to: '/todos', icon: ListTodo, label: 'To Dos' }
      ]
    },
    {
      label: 'Training',
      icon: BookOpen,
      items: [
        { to: '/homework', icon: BookOpen, label: 'My Homework' },
        { to: '/saved-plans', icon: FileText, label: 'Practice Plans' },
        { to: '/scenarios', icon: Target, label: 'Game Scenarios' },
        { to: '/coaches', icon: UserCircle, label: 'Private Coaching' },
        { to: '/clinics', icon: Calendar, label: 'Clinics' },
      ]
    },
    {
      label: 'Resources',
      icon: Grid,
      items: resourcesItems
    },
    {
      label: 'Performance & Progress',
      icon: BarChart2,
      items: [
        { to: '/progress', icon: BarChart2, label: 'Progress Reports' },
        { to: '/awards', icon: Award, label: 'Awards' },
        { to: '/scenarios/leaderboard', icon: Target, label: 'Scenario Rankings' }
      ]
    },
    
  ];

  // Mobile menu groups with the same structure
  const mobileMenuGroups = [
    {
      title: null,
      items: [
        { to: '/feed', icon: Bell, label: 'Feed' },
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' }
      ]
    },
    {
      title: 'Teams & Activities',
      items: [
        { to: '/teams', icon: Users, label: 'My Teams' },
        { to: '/games', icon: Trophy, label: 'Games' },
        { to: '/events', icon: Calendar, label: 'Events' },
        { to: '/volunteers', icon: HandHelping, label: 'Volunteers' },
        { to: '/todos', icon: ListTodo, label: 'To Dos' }
      ]
    },
    {
      title: 'Training',
      items: [
        { to: '/homework', icon: BookOpen, label: 'My Homework' },
        { to: '/saved-plans', icon: FileText, label: 'Practice Plans' },
        { to: '/coaches', icon: UserCircle, label: 'Private Coaching' },
        { to: '/scenarios', icon: Target, label: 'Game Scenarios' },
        { to: '/clinics', icon: Calendar, label: 'Clinics' },
      ]
    },
    {
      title: 'Resources',
      items: resourcesItems
    },
    {
      title: 'Performance & Progress',
      items: [
        { to: '/progress', icon: BarChart2, label: 'Progress Reports' },
        { to: '/awards', icon: Award, label: 'Awards' },
        { to: '/scenarios/leaderboard', icon: Target, label: 'Scenario Rankings' }
      ]
    },
   
  ];

  return (
    <>
      {/* Desktop Menu */}
      <div className="hidden md:block border-t">
        <nav className="flex items-center gap-6 h-12">
          {mainMenu.map((item, index) => (
            item.items ? (
              <Menu as="div" className="relative" key={index}>
                <Menu.Button className="flex items-center gap-2 px-3 py-2 text-brand hover:text-brand-dark rounded-lg hover:bg-brand-light text-sm">
                  <span>{item.label}</span>
                  <ChevronDown className="w-4 h-4" />
                </Menu.Button>
                <Transition
                  enter="transition duration-100 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-75 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                >
                  <Menu.Items className="absolute left-0 mt-1 w-56 origin-top-left bg-white rounded-lg 
                    shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none py-1">
                    {item.items.map((subItem, subIndex) => (
                      <Menu.Item key={subIndex}>
                        {({ active }) => (
                          <Link
                            to={subItem.to}
                            className={`${active ? 'bg-brand-light' : ''} flex items-center gap-3 px-4 py-2 text-sm text-brand-dark`}
                          >
                            <subItem.icon className="w-5 h-5" />
                            {subItem.label}
                          </Link>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <Link
                key={index}
                to={item.to}
                className="px-3 py-2 text-brand hover:text-brand-dark rounded-lg hover:bg-brand-light text-sm"
              >
                <span>{item.label}</span>
              </Link>
            )
          ))}
        </nav>
      </div>

      {/* Mobile Menu */}
      <>
        <div 
          className={`fixed inset-0 bg-black/30 z-40 transition-opacity md:hidden
            ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        <aside 
          className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white shadow-xl z-40 
            transform transition-transform duration-200 ease-in-out md:hidden
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="h-full overflow-y-auto">
            <nav className="p-4 space-y-6">
              {mobileMenuGroups.map((group, groupIndex) => (
                <div key={groupIndex}>
                  {group.title && (
                    <h3 className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-3">
                      {group.title}
                    </h3>
                  )}
                  <ul className="space-y-1">
                    {group.items.map((item, itemIndex) => (
                      <li key={itemIndex}>
                        <Link
                          to={item.to}
                          className="flex items-center gap-3 px-3 py-2 text-brand-dark hover:bg-brand-light rounded-lg"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </aside>
      </>
    </>
  );
};

export default NavigationMenu;