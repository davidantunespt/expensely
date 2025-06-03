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

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
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
    </div>
  );
}
