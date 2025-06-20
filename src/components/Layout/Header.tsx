import React from 'react';
import { OrganizationSelector } from './OrganizationSelector';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Bell, Settings, User } from 'lucide-react';

// Header component for the top of the app
export function Header() {
  const { currentOrganization } = useOrganization();

  return (
    <header className="bg-bg-primary border-b border-border-primary z-30">
      {/* Main header row */}
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">
        {/* App logo/name */}
        {/* Organization selector and info */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center space-x-4">
            <OrganizationSelector />
            
          </div>
        </div>

        {/* Right side icons */}
        <div className="flex items-center space-x-6">
          <button className="text-text-muted hover:text-text-secondary transition-colors">
            <Bell className="w-6 h-6" />
          </button>
          <button className="text-text-muted hover:text-text-secondary transition-colors">
            <Settings className="w-6 h-6" />
          </button>
          <button className="text-text-muted hover:text-text-secondary transition-colors">
            <User className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Info bar below header */}
      {currentOrganization && (
        <div className="bg-bg-muted border-t border-border-primary">
          <div className="max-w-7xl mx-auto px-8 py-2 flex items-center text-sm text-text-secondary">
            <span>
              Currently viewing data for <span className="font-semibold text-text-primary">{currentOrganization.name}</span>
            </span>
            <span className="mx-2 w-2 h-2 rounded-full bg-accent inline-block"></span>
            <span className="text-text-muted">{currentOrganization.memberCount} {currentOrganization.memberCount === 1 ? 'member' : 'members'}</span>
          </div>
        </div>
      )}
    </header>
  );
} 