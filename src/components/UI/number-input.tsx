"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface NumberInputProps {
  value?: number | null;
  onChange?: (value: number) => void;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

export function NumberInput({
  value,
  onChange,
  label,
  required = false,
  error,
  disabled = false,
  className,
  placeholder,
  min,
  max,
  step = 1,
}: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseFloat(e.target.value);
    if (!isNaN(numValue)) {
      onChange?.(numValue);
    } else if (e.target.value === '') {
      onChange?.(0);
    }
  };

  return (
    <Input
      type="number"
      value={value?.toString() || ''}
      onChange={handleChange}
      label={label}
      required={required}
      error={error}
      disabled={disabled}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      className={cn(
        "w-full px-2 py-2 border-2 border-gray-200 rounded-lg text-gray-900 text-sm leading-none bg-white text-right",
        className
      )}
    />
  );
} 