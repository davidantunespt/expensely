'use client';

import React from 'react';
import { Box } from '@/components/ui/Box';

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface ExpenseCategoryChartProps {
  data: CategoryData[];
  title?: string;
}

export function ExpenseCategoryChart({ data, title = "Expense by Category" }: ExpenseCategoryChartProps) {
  // Calculate total and percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Create pie chart segments
  let cumulativePercentage = 0;
  const segments = data.map((item) => {
    const percentage = (item.value / total) * 100;
    const segment = {
      ...item,
      percentage,
      startAngle: cumulativePercentage * 3.6, // Convert to degrees
      endAngle: (cumulativePercentage + percentage) * 3.6,
    };
    cumulativePercentage += percentage;
    return segment;
  });

  // Create SVG path for each segment
  const createPath = (startAngle: number, endAngle: number) => {
    const centerX = 100;
    const centerY = 100;
    const radius = 80;
    
    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  return (
    <Box minHeight="100%">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      
      <div className="flex items-center justify-between">
        {/* Pie Chart */}
        <div className="flex-shrink-0">
          <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
            {segments.map((segment) => (
              <path
                key={segment.name}
                d={createPath(segment.startAngle, segment.endAngle)}
                fill={segment.color}
                stroke="#f9f8f5"
                strokeWidth="2"
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 ml-8 space-y-4">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-base font-medium text-gray-800">{item.name}</span>
              </div>
              <span className="text-base font-semibold text-gray-900">
                {item.value.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="mt-6 pt-4 border-t border-gray-300">
        <div className="flex items-center justify-between">
          <span className="text-base font-medium text-gray-700">Total</span>
          <span className="text-lg font-bold text-gray-900">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>
    </Box>
  );
} 