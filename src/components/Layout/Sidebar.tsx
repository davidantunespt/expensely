'use client';

import React, { useState, useEffect } from 'react';
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
  HelpCircle,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { OrganizationManagement } from '@/components/Layout/OrganizationManagement';

// Navigation items based on the app requirements
const navigationItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Home,
    // description: 'Overview & analytics'
  },
  {
    name: 'Upload Receipt',
    href: '/upload',
    icon: Camera,
    // description: 'Add new expenses'
  },
  {
    name: 'Expenses',
    href: '/expenses',
    icon: FolderOpen,
    // description: 'Manage transactions'
  },
  {
    name: 'Invoicing',
    href: '/invoicing',
    icon: Receipt,
    // description: 'Billable tracking'
  },
  {
    name: 'Tax Reports',
    href: '/reports',
    icon: BarChart3,
    // description: 'Tax & analytics'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    // description: 'Profile & preferences'
  }
];

const bottomNavItems = [
  {
    name: 'Notifications',
    href: '/notifications',
    icon: Bell,
    // description: 'Alerts & reminders'
  },
  {
    name: 'Subscription',
    href: '/subscription',
    icon: Users,
    // description: 'Plan management'
  },
  {
    name: 'Help',
    href: '/help',
    icon: HelpCircle,
    // description: 'Support center'
  }
];

interface SidebarProps {
  isCollapsed?: boolean;
}

export function Sidebar({ isCollapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<{ first_name: string | null; last_name: string | null } | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [isManagementOpen, setIsManagementOpen] = useState(false);

  // Fetch user profile data using ProfileService
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        console.log("🔐 User:", user);
        try {
          setProfile({
            first_name: user.user_metadata.first_name,
            last_name: user.user_metadata.last_name
          });
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    };

    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      // The redirection is now handled by the AuthContext
    } catch (error) {
      console.error('Sign out error:', error);
      setSigningOut(false); // Reset loading state if there's an error
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  // Get display name
  const getDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (user?.email) {
      return user.email;
    }
    return 'User';
  };

  return (
    <div 
      className={`fixed top-0 left-0 h-screen border-r border-border-primary bg-bg-primary flex flex-col transition-all duration-300 z-40 overflow-y-auto ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-border-primary">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-text-inverse font-bold text-base">RT</span>
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-semibold text-text-primary">Receipt Tracker</h1>
              <p className="text-xs text-text-secondary">Freelancer Edition</p>
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
              className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group border ${
                isActive 
                  ? 'text-text-primary bg-bg-accent border-border-accent' 
                  : 'text-text-secondary hover:bg-bg-muted hover:text-text-primary border-transparent'
              }`}
              title={isCollapsed ? item.name : undefined}
            >
              <IconComponent className="w-5 h-5 mr-3 flex-shrink-0" />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-base truncate" style={{ fontWeight: 600 }}>{item.name}</p>
                  <p className="text-xs text-text-muted truncate">{item.description}</p>
                </div>
              )}
              {!isCollapsed && isActive && (
                <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0"></div>
              )}
            </Link>
          );
        })}
      </nav>

      <OrganizationManagement
        isOpen={isManagementOpen}
        onClose={() => setIsManagementOpen(false)}
      />
      {/* Bottom Navigation */}
      <div className="px-4 py-6 border-t border-border-primary space-y-2">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group border ${
                isActive 
                  ? 'text-text-primary bg-bg-accent border-border-accent' 
                  : 'text-text-secondary hover:bg-bg-muted hover:text-text-primary border-transparent'
              }`}
              title={isCollapsed ? item.name : undefined}
            >
              <IconComponent className="w-5 h-5 mr-3 flex-shrink-0" />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-base truncate" style={{ fontWeight: 600 }}>{item.name}</p>
                  <p className="text-xs text-text-muted truncate">{item.description}</p>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {!isCollapsed && (
        <div className="px-4 py-4 border-t border-border-primary">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-secondary-300 rounded-full flex items-center justify-center">
              <span className="text-text-primary text-base font-medium">{getUserInitials()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-medium text-text-primary truncate">{getDisplayName()}</p>
              <p className="text-xs text-text-secondary truncate">Freelancer</p>
            </div>
          </div>
          
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className={`flex items-center w-full px-3 py-2 text-sm rounded-lg transition-colors ${
              signingOut 
                ? 'text-text-muted cursor-not-allowed' 
                : 'text-text-secondary hover:bg-bg-muted hover:text-text-primary cursor-pointer'
            }`}
          >
            {signingOut ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-text-muted mr-2"></div>
            ) : (
              <LogOut className="w-4 h-4 mr-2" />
            )}
            {signingOut ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  );
} 