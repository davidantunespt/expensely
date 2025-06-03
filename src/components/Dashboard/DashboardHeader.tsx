'use client';

import React from 'react';
import { Bell } from 'lucide-react';

export function DashboardHeader() {
  return (
    <div className="flex items-center justify-between mb-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-700 mt-1">Welcome back! Here&apos;s your expense overview.</p>
      </div>

      {/* Notification Bell */}
      <div className="flex items-center space-x-4">
        {/* Notification Icon */}
        <button className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors">
          <Bell className="w-6 h-6" />
          {/* Notification Badge */}
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-gray-700 rounded-full border-2" style={{ borderColor: '#f9f8f5' }}></span>
        </button>

        {/* User Avatar */}
        <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">JD</span>
        </div>
      </div>
    </div>
  );
} 