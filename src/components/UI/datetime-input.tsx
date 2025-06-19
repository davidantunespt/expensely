"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/UI/Button"
import { Calendar } from "@/components/UI/calendar"
import { Input } from "@/components/UI/input"
import { Label } from "@/components/UI/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/UI/popover"
import { cn } from "@/lib/utils"

interface DateTimeInputProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export function DateTimeInput({
  value,
  onChange,
  label,
  required = false,
  error,
  disabled = false,
  className,
  placeholder,
}: DateTimeInputProps) {
  const [open, setOpen] = React.useState(false)
  
  // Parse the current value into date and time components
  const currentDate = value ? new Date(value) : undefined;
  const currentTimeString = currentDate ? 
    `${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}:${currentDate.getSeconds().toString().padStart(2, '0')}` 
    : "00:00:00";

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Combine the selected date with the current time
      const currentTime = currentDate || new Date();
      selectedDate.setHours(currentTime.getHours());
      selectedDate.setMinutes(currentTime.getMinutes());
      selectedDate.setSeconds(currentTime.getSeconds());
      
      onChange?.(selectedDate.toISOString());
    }
    setOpen(false);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value;
    const [hours, minutes, seconds] = timeValue.split(':').map(Number);
    
    // Use current date or today if no date is selected
    const targetDate = currentDate ? new Date(currentDate) : new Date();
    targetDate.setHours(hours || 0);
    targetDate.setMinutes(minutes || 0);
    targetDate.setSeconds(seconds || 0);
    
    onChange?.(targetDate.toISOString());
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return placeholder || "Select date";
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <Label className="text-sm font-semibold text-gray-800 tracking-wide">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      <div className="flex gap-4">
        {/* Date Picker */}
        <div className="flex-1">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={disabled}
                className={cn(
                  "w-full h-9 px-3 py-2 justify-between items-center font-normal border-2 border-gray-200 rounded-lg text-gray-900 text-sm bg-white hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:border-gray-400 transition-colors",
                  !currentDate && "text-muted-foreground",
                  error && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500",
                  disabled && "opacity-50 cursor-not-allowed bg-gray-50 hover:bg-gray-50"
                )}
              >
                <span className="truncate text-left flex-1">
                  {formatDate(currentDate)}
                </span>
                <CalendarIcon className="h-3.5 w-3.5 text-text-muted" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={handleDateSelect}
                captionLayout="dropdown"
                disabled={disabled}
              />
            </PopoverContent>
          </Popover>
        </div>

                 {/* Time Picker */}
         <div className="w-32">
           <Input
             type="time"
             step="1"
             value={currentTimeString}
             onChange={handleTimeChange}
             disabled={disabled}
             className={cn(
               "h-9 px-3 py-2 border-2 border-gray-200 rounded-lg text-gray-900 text-sm bg-white hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:border-gray-400 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none transition-colors",
               error && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500"
             )}
           />
         </div>
      </div>
      
      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}
    </div>
  );
} 