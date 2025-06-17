'use client';

import React from 'react';
import { DollarSign, CheckCircle, Camera, Plus } from 'lucide-react';
import { Box } from '@/components/UI/Box';

interface SummaryCardsProps {
  totalExpenses: number;
  taxDeductible: number;
  currentMonth: string;
}

export function SummaryCards({ totalExpenses, taxDeductible, currentMonth }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
      {/* Total Expenses Card */}
      <Box>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-medium text-gray-700 mb-1">Total Expenses</p>
            <p className="text-3xl font-bold text-gray-900">
              ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-base text-gray-600 mt-1">for {currentMonth}</p>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-gray-700" />
          </div>
        </div>
      </Box>

      {/* Tax Deductible Card */}
      <Box>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-medium text-gray-700 mb-1">Tax Deductible</p>
            <p className="text-3xl font-bold text-gray-800">
              ${taxDeductible.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-base text-gray-600 mt-1">this month</p>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-gray-700" />
          </div>
        </div>
      </Box>

      {/* Upload Receipt Action Card */}
      <Box 

        className="text-white border-gray-600"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-medium text-gray-300 mb-1">Quick Action</p>
            <p className="text-lg font-semibold mb-3">Upload Receipt</p>
            <button 
              className="px-4 py-2 rounded-lg font-medium text-base hover:bg-gray-100 transition-colors flex items-center space-x-2 text-gray-800"

            >
              <Plus className="w-4 h-4" />
              <span>Upload Receipt</span>
            </button>
          </div>
          <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
            <Camera className="w-6 h-6 text-white" />
          </div>
        </div>
      </Box>
    </div>
  );
} 