import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  UserPlus, 
  Video, 
  BarChart3, 
  Settings,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const Sidebar = () => {
  const { sidebarOpen, setSidebarOpen } = useApp();
  const location = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      description: 'Overview and quick actions'
    },
    {
      name: 'Create Class',
      href: '/create-class',
      icon: Plus,
      description: 'Add new class'
    },
    {
      name: 'Manage Classes',
      href: '/manage-classes',
      icon: BookOpen,
      description: 'View and edit classes'
    },
    {
      name: 'Register Student',
      href: '/register-student',
      icon: UserPlus,
      description: 'Add students to classes'
    },
    {
      name: 'Live Session',
      href: '/live-attentiveness',
      icon: Video,
      description: 'Real-time tracking'
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: BarChart3,
      description: 'Analytics and insights'
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" 
          onClick={() => setSidebarOpen(false)} // Ensure this closes the sidebar
        />
      )}
      
      {/* Sidebar - positioned below header */}
      <div className={`
        fixed left-0 z-30 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out
        top-16 h-[calc(100vh-4rem)]
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        w-64
      `}>
        <div className="flex flex-col h-full">
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => {
                    // Close sidebar on mobile when navigating
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`
                    flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200
                    ${isActive(item.href)
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon 
                    className={`mr-3 h-5 w-5 ${
                      isActive(item.href) ? 'text-blue-600' : 'text-gray-400'
                    }`} 
                  />
                  <div className="flex flex-col">
                    <span>{item.name}</span>
                    <span className="text-xs text-gray-500 mt-0.5">
                      {item.description}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="px-4 py-4 border-t border-gray-200">
            <Link
              to="/profile"
              onClick={() => {
                // Close sidebar on mobile when navigating
                if (window.innerWidth < 1024) {
                  setSidebarOpen(false);
                }
              }}
              className={`
                flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                ${isActive('/profile')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <Settings className="mr-3 h-5 w-5 text-gray-400" />
              Profile & Settings
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;