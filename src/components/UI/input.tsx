import * as React from "react"
import { Label } from "@/components/UI/label"
import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  label?: string
  error?: string
  required?: boolean
}

function Input({ 
  className, 
  type, 
  label, 
  error, 
  required = false,
  id,
  ...props 
}: InputProps) {
  // Always call useId, then use provided id or generated one
  const generatedId = React.useId()
  const inputId = id || generatedId
  
  const inputElement = (
    <input
      type={type}
      id={inputId}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "aria-invalid:ring-red-500/20 aria-invalid:border-red-500",
        error && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500",
        className
      )}
      aria-invalid={error ? "true" : "false"}
      {...props}
    />
  )

  if (label) {
    return (
      <div className="grid w-full items-center gap-1">
        <Label htmlFor={inputId} className="text-sm font-semibold text-gray-800 tracking-wide">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {inputElement}
        {error && (
          <p className="text-sm text-red-500 mt-1">{error}</p>
        )}
      </div>
    )
  }

  return inputElement
}

export { Input, type InputProps }
