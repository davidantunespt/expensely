import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 w-8 [&_svg]:h-3.5 [&_svg]:w-3.5",
        default: "h-9 w-9 [&_svg]:h-4 [&_svg]:w-4",
        lg: "h-10 w-10 [&_svg]:h-5 [&_svg]:w-5",
        xl: "h-12 w-12 [&_svg]:h-6 [&_svg]:w-6",
      },
      radius: {
        default: "rounded-lg",
        sm: "rounded-md",
        lg: "rounded-xl",
        full: "rounded-full",
      }
    },
    defaultVariants: {
      variant: "ghost",
      size: "default",
      radius: "default",
    },
  }
)

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  asChild?: boolean
  icon?: React.ReactNode
  tooltip?: string
  tooltipSide?: "top" | "right" | "bottom" | "left"
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    radius, 
    asChild = false, 
    icon, 
    tooltip,
    tooltipSide = "top",
    children, 
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const buttonElement = (
      <Comp
        className={cn(iconButtonVariants({ variant, size, radius, className }))}
        ref={ref}
        {...props}
      >
        {icon || children}
      </Comp>
    )

    if (tooltip) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {buttonElement}
          </TooltipTrigger>
          <TooltipContent side={tooltipSide}>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      )
    }

    return buttonElement
  }
)
IconButton.displayName = "IconButton"

export { IconButton, iconButtonVariants } 