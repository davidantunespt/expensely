import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
  "items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-green-500 text-white shadow-xs hover:bg-green-600 focus-visible:ring-green-200 dark:focus-visible:ring-green-400 dark:bg-green-600/60",
      },
      size: {
        default: "h-9 px-4 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  fullWidth = false,
  loading = false,
  icon,
  children,
  disabled,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    fullWidth?: boolean
    loading?: boolean
    icon?: React.ReactNode
  }) {
  const Comp = asChild ? Slot : "button"
  const isDisabled = disabled || loading

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size }),
        fullWidth && "w-full inline-flex",
        loading && "cursor-not-allowed",
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      <div className="flex items-center gap-2">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : icon ? (
          <span className="h-4 w-4 flex items-center justify-center [&>svg]:h-4 [&>svg]:w-4">
            {icon}
          </span>
        ) : null}
        <span className={cn(loading && "opacity-70", "flex w-full items-center gap-2")}>
          {children}
        </span>
      </div>
    </Comp>
  )
}

export { Button, buttonVariants }
