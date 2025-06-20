'use client';

import React from 'react';
import { Box } from '@/components/ui/Box';

interface MonthlyData {
  month: string;
  amount: number;
}

interface ExpenseOverviewChartProps {
  data: MonthlyData[];
  title?: string;
}

export function ExpenseOverviewChart({ data, title = "Expense Overview" }: ExpenseOverviewChartProps) {
  // Calculate chart dimensions and scaling
  const chartWidth = 600;
  const chartHeight = 200;
  const padding = 40;
  
  const maxAmount = Math.max(...data.map(d => d.amount));
  const minAmount = Math.min(...data.map(d => d.amount));
  
  // Create points for the line
  const points = data.map((item, index) => {
    const x = padding + (index * (chartWidth - 2 * padding)) / (data.length - 1);
    const y = chartHeight - padding - ((item.amount - minAmount) / (maxAmount - minAmount)) * (chartHeight - 2 * padding);
    return { x, y, amount: item.amount, month: item.month };
  });

  // Create path for the line
  const linePath = points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }
    return `${path} L ${point.x} ${point.y}`;
  }, '');

  // Create path for the area fill
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`;

  return (
    <Box>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
            <span className="text-base text-gray-700">Monthly Expenses</span>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative">
        <svg 
          width={chartWidth} 
          height={chartHeight} 
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto"
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e5e5e5" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Area fill */}
          <path
            d={areaPath}
            fill="url(#gradient)"
            className="opacity-20"
          />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#4a5568"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#4a5568"
              stroke="#f9f8f5"
              strokeWidth="2"
              className="hover:r-6 transition-all cursor-pointer"
            />
          ))}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4a5568" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#4a5568" stopOpacity="0.1"/>
            </linearGradient>
          </defs>
        </svg>

        {/* Month labels */}
        <div className="flex justify-between mt-4 px-10">
          {data.map((item, index) => (
            <span 
              key={index} 
              className="text-xs text-gray-600 text-center"
              style={{ width: `${100 / data.length}%` }}
            >
              {item.month}
            </span>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-300 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-base text-gray-700">Current Month</p>
          <p className="text-lg font-semibold text-gray-900">
            ${data[data.length - 1]?.amount.toLocaleString() || '0'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-base text-gray-700">Average</p>
          <p className="text-lg font-semibold text-gray-900">
            ${Math.round(data.reduce((sum, item) => sum + item.amount, 0) / data.length).toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-base text-gray-700">Trend</p>
          <p className="text-lg font-semibold text-gray-800">↗ +12%</p>
        </div>
      </div>
    </Box>
  );
} 