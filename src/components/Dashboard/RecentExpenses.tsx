'use client';

import React from 'react';
import { Expense } from '@/lib/mockData';
import { 
  Plane, 
  Coffee, 
  Paperclip, 
  Monitor, 
  Smartphone, 
  FileText,
  FolderOpen
} from 'lucide-react';
import { Box } from '@/components/UI/Box';

interface RecentExpensesProps {
  expenses: Expense[];
  title?: string;
}

// Helper function to get category icon
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Travel':
      return Plane;
    case 'Meals':
      return Coffee;
    case 'Office Supplies':
      return Paperclip;
    case 'Software':
      return Monitor;
    case 'Marketing':
      return Smartphone;
    default:
      return FileText;
  }
};

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};

export function RecentExpenses({ expenses, title = "Latest Expenses" }: RecentExpensesProps) {
  return (
    <Box minHeight="400px" className="flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button className="text-base text-gray-700 hover:text-gray-900 font-medium">
          View All
        </button>
      </div>

      <div className="space-y-4 flex-1">
        {expenses.map((expense) => {
          const IconComponent = getCategoryIcon(expense.category);
          
          return (
            <div 
              key={expense.id} 
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
            >
              {/* Left side - Icon and Details */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <IconComponent className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <p className="text-base font-medium text-gray-900">{expense.vendor}</p>
                  <p className="text-xs text-gray-600">{formatDate(expense.date)}</p>
                </div>
              </div>

              {/* Right side - Amount and Status */}
              <div className="flex items-center space-x-3">
                {expense.isDeductible && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                    Tax Deductible
                  </span>
                )}
                <span className="text-base font-semibold text-gray-900">
                  ${expense.amount.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}

        {/* Add some padding at the bottom to match the category chart height */}
        {expenses.length > 0 && expenses.length < 5 && (
          <div className="flex-1"></div>
        )}
      </div>

      {expenses.length === 0 && (
        <div className="text-center py-8 flex-1 flex flex-col justify-center">
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-3">
            <FolderOpen className="w-6 h-6 text-gray-600" />
          </div>
          <p className="text-base text-gray-600">No recent invoices</p>
          <p className="text-xs text-gray-500 mt-1">Upload your first receipt to get started</p>
        </div>
      )}

      {/* Bottom summary section to match category chart structure */}
      {expenses.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-300">
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-gray-700">Total Items</span>
            <span className="text-lg font-bold text-gray-900">
              {expenses.length}
            </span>
          </div>
        </div>
      )}
    </Box>
  );
} 