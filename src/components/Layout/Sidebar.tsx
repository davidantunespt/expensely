'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Camera,
  FolderOpen,
  Receipt,
  BarChart3,
  Settings,
  Bell,
  Users,
  HelpCircle
} from 'lucide-react';

// Navigation items based on the app requirements
const navigationItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Home,
    description: 'Overview & analytics'
  },
  {
    name: 'Upload Receipt',
    href: '/upload',
    icon: Camera,
    description: 'Add new expenses'
  },
  {
    name: 'Expenses',
    href: '/expenses',
    icon: FolderOpen,
    description: 'Manage transactions'
  },
  {
    name: 'Invoicing',
    href: '/invoicing',
    icon: Receipt,
    description: 'Billable tracking'
  },
  {
    name: 'Tax Reports',
    href: '/reports',
    icon: BarChart3,
    description: 'Tax & analytics'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Profile & preferences'
  }
];

const bottomNavItems = [
  {
    name: 'Notifications',
    href: '/notifications',
    icon: Bell,
    description: 'Alerts & reminders'
  },
  {
    name: 'Subscription',
    href: '/subscription',
    icon: Users,
    description: 'Plan management'
  },
  {
    name: 'Help',
    href: '/help',
    icon: HelpCircle,
    description: 'Support center'
  }
];

interface SidebarProps {
  isCollapsed?: boolean;
}

export function Sidebar({ isCollapsed = false }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div 
      className={`fixed top-0 left-0 h-screen border-r border-gray-300 flex flex-col transition-all duration-300 z-40 overflow-y-auto ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      style={{ backgroundColor: '#ffffff' }}
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-300">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-base">RT</span>
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Receipt Tracker</h1>
              <p className="text-xs text-gray-600">Freelancer Edition</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'text-gray-900 border' 
                  : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
              }`}
              style={isActive ? { backgroundColor: '#f5f5f4', borderColor: '#ededed' } : undefined}
              title={isCollapsed ? item.name : undefined}
            >
              <IconComponent className="w-5 h-5 mr-3 flex-shrink-0" />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-base truncate" style={{ fontWeight: 600 }}>{item.name}</p>
                  <p className="text-xs text-gray-600 truncate">{item.description}</p>
                </div>
              )}
              {!isCollapsed && isActive && (
                <div className="w-2 h-2 bg-gray-800 rounded-full flex-shrink-0"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-4 py-6 border-t border-gray-300 space-y-2">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'text-gray-900 border' 
                  : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
              }`}
              style={isActive ? { backgroundColor: '#f5f5f4', borderColor: '#ededed' } : undefined}
              title={isCollapsed ? item.name : undefined}
            >
              <IconComponent className="w-5 h-5 mr-3 flex-shrink-0" />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-base truncate" style={{ fontWeight: 600 }}>{item.name}</p>
                  <p className="text-xs text-gray-600 truncate">{item.description}</p>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* User Profile Section */}
      {!isCollapsed && (
        <div className="px-4 py-4 border-t border-gray-300">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-800 text-base font-medium">JD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-medium text-gray-900 truncate">John Doe</p>
              <p className="text-xs text-gray-600 truncate">Freelancer</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 