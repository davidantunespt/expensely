import React from 'react';
import { Download } from 'lucide-react';

interface ExpensesHeaderProps {
  title: string;
  description: string;
  totalAmount?: number;
  totalLabel?: string;
  actionButtonText?: string;
  actionButtonIcon?: React.ReactNode;
  onActionClick?: () => void;
}

export function ExpensesHeader({
  title,
  description,
  totalAmount,
  totalLabel = 'Total Expenses',
  actionButtonText = 'Export',
  actionButtonIcon = <Download className="w-5 h-5" />,
  onActionClick
}: ExpensesHeaderProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">{title}</h1>
          <p className="text-text-secondary mt-2 text-lg">
            {description}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {totalAmount !== undefined && (
            <div className="text-right">
              <div className="text-2xl font-bold text-text-primary">
                {formatCurrency(totalAmount)}
              </div>
              <div className="text-sm text-text-secondary">{totalLabel}</div>
            </div>
          )}
          {onActionClick && (
            <button 
              onClick={onActionClick}
              className="flex items-center space-x-2 px-6 py-3 bg-primary text-text-inverse rounded-xl hover:bg-primary-700 transition-all duration-200"
            >
              {actionButtonIcon}
              <span>{actionButtonText}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 