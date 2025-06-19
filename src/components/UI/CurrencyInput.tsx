"use client";

import * as React from "react";
import { Input } from "@/components/UI/input";
import { cn } from "@/lib/utils";

interface CurrencyInputProps {
  value?: number | null;
  onChange?: (value: number | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  currency?: string;
  min?: number;
  max?: number;
  label?: string;
  required?: boolean;
  error?: string;
}

export function CurrencyInput({
  value,
  onChange,
  placeholder = "0.00",
  className,
  disabled = false,
  currency = "€",
  min,
  max,
  label,
  required = false,
  error,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = React.useState("");
  const [isFocused, setIsFocused] = React.useState(false);

  // Update display value when prop value changes
  React.useEffect(() => {
    if (value !== null && value !== undefined) {
      if (isFocused) {
        // When focused, show raw number for easier editing
        setDisplayValue(value.toString());
      } else {
        // When not focused, show formatted currency
        setDisplayValue(value.toFixed(2));
      }
    } else {
      setDisplayValue("");
    }
  }, [value, isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow empty string
    if (inputValue === "") {
      setDisplayValue("");
      onChange?.(null);
      return;
    }

    // Only allow valid number patterns while typing
    const validPattern = /^[0-9]*\.?[0-9]*$/;
    if (!validPattern.test(inputValue)) {
      return; // Don't update if invalid pattern
    }

    setDisplayValue(inputValue);

    // Parse the number
    const numericValue = parseFloat(inputValue);
    
    // Check if it's a valid number
    if (!isNaN(numericValue)) {
      // Apply min/max constraints
      let constrainedValue = numericValue;
      if (min !== undefined && constrainedValue < min) {
        constrainedValue = min;
      }
      if (max !== undefined && constrainedValue > max) {
        constrainedValue = max;
      }
      
      onChange?.(constrainedValue);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    // When focusing, show raw number for easier editing
    if (value !== null && value !== undefined) {
      setDisplayValue(value.toString());
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // When blurring, format the display value
    if (value !== null && value !== undefined) {
      setDisplayValue(value.toFixed(2));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, period, and numbers
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 
      'ArrowUp', 'ArrowDown', 'Home', 'End', 'Period', '.', ','
    ];
    
    // Allow Ctrl/Cmd combinations for copy/paste/select all
    if (e.ctrlKey || e.metaKey) {
      return;
    }
    
    // Allow allowed keys
    if (allowedKeys.includes(e.key)) {
      return;
    }
    
    // Allow numbers
    if (/^[0-9]$/.test(e.key)) {
      return;
    }
    
    // Prevent all other keys
    e.preventDefault();
  };

  return (
    <div className={cn("relative", className)}>
      <Input
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        label={label}
        required={required}
        error={error}
        className="pl-8 pr-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-text-primary bg-bg-primary focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent transition-all duration-200"
      />
      <span 
        className="absolute left-3 text-text-muted text-sm font-medium pointer-events-none"
        style={{ 
          top: label ? 'calc(50% + 14px)' : '50%',
          transform: 'translateY(-50%)'
        }}
      >
        {currency}
      </span>
    </div>
  );
} 