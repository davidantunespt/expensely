'use client'

import { useAuth } from '@/contexts/AuthContext';
import { SummaryCards } from '@/components/Dashboard/SummaryCards';
import { ExpenseOverviewChart } from '@/components/Dashboard/ExpenseOverviewChart';
import { ExpenseCategoryChart } from '@/components/Dashboard/ExpenseCategoryChart';
import { RecentExpenses } from '@/components/Dashboard/RecentExpenses';
import { 
  mockDashboardSummary, 
  mockCategoryData, 
  mockMonthlyData 
} from '@/lib/mockData';
import Link from 'next/link';

export default function HomePage() {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-secondary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-secondary">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-2">Access Denied</h2>
          <p className="text-text-secondary">Please log in to access the dashboard.</p>
          <Link href="/login" className="text-accent hover:text-accent-700">Login</Link>
        </div>
      </div>
    );
  }

  return (

      <div className="flex-1 bg-bg-secondary">        
        {/* Main Dashboard Content */}
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Summary Cards */}
          <div className="mb-8">
            <SummaryCards 
              totalExpenses={mockDashboardSummary.totalExpenses}
              taxDeductible={mockDashboardSummary.taxDeductible}
              currentMonth={mockDashboardSummary.currentMonth}
            />
          </div>
          
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <ExpenseOverviewChart data={mockMonthlyData} />
            <ExpenseCategoryChart data={mockCategoryData} />
          </div>
          
          {/* Recent Expenses */}
          <div className="mb-8">
            <RecentExpenses expenses={mockDashboardSummary.recentExpenses} />
          </div>
        </div>
        
        {/* Debug Info */}
        <div className="mt-8 p-4 bg-accent-50 border border-accent-200 rounded-md">
          <h3 className="text-sm font-medium text-accent-900 mb-2">🔐 Authentication Status</h3>
          <p className="text-xs text-accent-700">
            User: {user?.email} | 
            ID: {user?.id?.substring(0, 8)}... | 
            Status: Authenticated ✅
          </p>
        </div>
      </div>

  );
}
