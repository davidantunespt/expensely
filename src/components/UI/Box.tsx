import React from 'react';

interface BoxProps {
  children: React.ReactNode;
  className?: string;
  minHeight?: string;
  style?: React.CSSProperties;
}

export function Box({ 
  children, 
  className = '', 
  minHeight,
  style = {},
  ...props 
}: BoxProps) {
  const baseClasses = 'rounded-xl border p-6';
  const combinedClasses = className ? `${baseClasses} ${className}` : baseClasses;
  
  const baseStyle = { 
    backgroundColor: 'rgba(79, 70, 229, 0.02)',
    borderColor: '#e1e1e1',
    ...(minHeight && { minHeight }),
    ...style
  };

  return (
    <div 
      className={combinedClasses}
      style={baseStyle}
      {...props}
    >
      {children}
    </div>
  );
} 