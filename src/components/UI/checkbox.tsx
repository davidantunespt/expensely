"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer h-5 w-5 rounded-sm border-2 border-gray-200 bg-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-gray-600 data-[state=checked]:border-gray-600 data-[state=checked]:text-white transition-colors",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn("flex items-center justify-center text-current")}
      >
        <CheckIcon className="h-4 w-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

// Enhanced Checkbox with Label support
interface CheckboxWithLabelProps {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
  children?: React.ReactNode;
}

function CheckboxWithLabel({
  id,
  checked,
  onCheckedChange,
  disabled,
  label,
  required = false,
  error,
  className,
  children,
}: CheckboxWithLabelProps) {
  const generatedId = React.useId();
  const checkboxId = id || generatedId;

  const checkboxElement = (
    <Checkbox
      id={checkboxId}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={cn(error && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500", className, "cursor-pointer")}
    />
  );

  if (label) {
    return (
      <div className="flex items-start space-x-3 p-4 bg-gray-50 border-2 border-gray-100 rounded-lg">
        {checkboxElement}
        <div className="flex-1">
          <Label htmlFor={checkboxId} className="flex-1 items-start flex-col gap-3 cursor-pointer">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
            {children}
          </Label>
          {error && (
            <p className="text-sm text-red-500 mt-1">{error}</p>
          )}
        </div>
      </div>
    );
  }

  return checkboxElement;
}

export { Checkbox, CheckboxWithLabel } 