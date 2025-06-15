'use client'

import { useAuth } from '@/contexts/AuthContext';
import { DashboardHeader } from '@/components/Dashboard/DashboardHeader';
import { SummaryCards } from '@/components/Dashboard/SummaryCards';
import { ExpenseCategoryChart } from '@/components/Dashboard/ExpenseCategoryChart';
import { RecentExpenses } from '@/components/Dashboard/RecentExpenses';
import { ExpenseOverviewChart } from '@/components/Dashboard/ExpenseOverviewChart';
import { 
  mockDashboardSummary, 
  mockCategoryData, 
  mockMonthlyData 
} from '@/lib/mockData';
import Link from 'next/link';

export default function Dashboard() {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // This should never happen due to middleware, but extra safety check
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">Please log in to access the dashboard.</p>
            <Link href="/login" className="text-blue-600 hover:text-blue-800">Login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section - Now has access to user data */}
      <DashboardHeader />

      {/* Summary Cards */}
      <SummaryCards 
        totalExpenses={mockDashboardSummary.totalExpenses}
        taxDeductible={mockDashboardSummary.taxDeductible}
        currentMonth={mockDashboardSummary.currentMonth}
      />

      {/* Main Content Grid - Two Equal Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Left Column - Category Chart */}
        <div>
          <ExpenseCategoryChart data={mockCategoryData} />
        </div>

        {/* Right Column - Recent Expenses */}
        <div>
          <RecentExpenses expenses={mockDashboardSummary.recentExpenses} />
        </div>
      </div>

      {/* Bottom Section - Expense Overview Chart */}
      <div className="mb-4">
        <ExpenseOverviewChart data={mockMonthlyData} />
      </div>

      {/* Debug info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-sm font-medium text-blue-900 mb-2">🔐 Authentication Status</h3>
          <p className="text-xs text-blue-700">
            Authenticated as: {user.email} (ID: {user.id})
          </p>
        </div>
      )}
    </div>
  );
}
