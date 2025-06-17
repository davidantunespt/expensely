import React from 'react';
import { OrganizationSelector } from './OrganizationSelector';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Bell, Settings, User } from 'lucide-react';

// Header component for the top of the app
export function Header({ onOpenManagement }: { onOpenManagement?: () => void }) {
  const { currentOrganization } = useOrganization();

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm z-30">
      {/* Main header row */}
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">
        {/* App logo/name */}
        <div className="flex items-center space-x-3 min-w-[220px]">
          <div className="w-10 h-10 rounded-xl bg-[#19e2c0] flex items-center justify-center">
            {/* Simple icon for logo */}
            <span className="text-white text-2xl font-bold">💵</span>
          </div>
          <div>
            <div className="text-xl font-bold text-gray-800 leading-tight">Receipt Tracker</div>
            <div className="text-xs text-gray-400 font-medium">Freelancer Edition</div>
          </div>
        </div>
        {/* Organization selector and info */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center space-x-4">
            <OrganizationSelector onOpenManagement={onOpenManagement || (() => {})} />
            
          </div>
        </div>

        {/* Right side icons */}
        <div className="flex items-center space-x-6">
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="w-6 h-6" />
          </button>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <Settings className="w-6 h-6" />
          </button>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <User className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Info bar below header */}
      {currentOrganization && (
        <div className="w-full bg-gray-100 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-8 py-2 flex items-center text-sm text-gray-700">
            <span>
              Currently viewing data for <span className="font-semibold text-gray-800">{currentOrganization.name}</span>
            </span>
            <span className="mx-2 w-2 h-2 rounded-full bg-[#19e2c0] inline-block"></span>
            <span className="text-gray-400">{currentOrganization.memberCount} {currentOrganization.memberCount === 1 ? 'member' : 'members'}</span>
          </div>
        </div>
      )}
    </header>
  );
} 