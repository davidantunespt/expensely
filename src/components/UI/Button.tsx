import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'flex items-center justify-center rounded-lg font-medium transition-colors cursor-pointer';
  
  const variantClasses = {
    primary: 'bg-primary text-text-inverse hover:bg-primary-800 disabled:bg-primary-400',
    secondary: 'border border-border-secondary bg-bg-primary text-text-primary hover:bg-bg-muted disabled:bg-secondary-200',
    success: 'bg-success-green text-text-inverse hover:bg-success-green-700 disabled:bg-success-green-400',
    danger: 'bg-red-600 text-text-inverse hover:bg-red-700 disabled:bg-red-400'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  };

  const isDisabled = disabled || loading;

  const combinedClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    isDisabled ? 'cursor-not-allowed' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={combinedClasses}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <Loader2 className={`${iconSizes[size]} mr-2 animate-spin`} />
      ) : icon ? (
        <span className={`${iconSizes[size]} mr-2 flex items-center`}>
          {icon}
        </span>
      ) : null}
      <span style={{ lineHeight: '1' }}>{children}</span>
    </button>
  );
} 