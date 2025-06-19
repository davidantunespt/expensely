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
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        error && "border-destructive",
        className
      )}
      aria-invalid={error ? "true" : "false"}
      {...props}
    />
  )

  if (label) {
    return (
      <div className="grid w-full items-center gap-2">
        <Label htmlFor={inputId} className="text-sm font-semibold text-text-primary">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {inputElement}
        {error && (
          <p className="text-sm text-destructive mt-1">{error}</p>
        )}
      </div>
    )
  }

  return inputElement
}

export { Input, type InputProps }
