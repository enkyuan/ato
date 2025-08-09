"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-medium transition-all duration-200 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/80 shadow-xs",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-xs",
        ghost:
          "text-foreground hover:bg-accent/80 hover:text-accent-foreground",
        outline:
          "border bg-transparent text-foreground hover:bg-accent/80 hover:text-accent-foreground shadow-xs",
        link: "text-foreground hover:underline",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/80 focus-visible:ring-destructive/50 shadow-xs",
      },
      size: {
        sm: "h-8 px-3 gap-1",
        md: "h-9 px-4",
        lg: "h-10 px-5",
        "icon-sm": "size-8 [&_svg:not([class*='size-'])]:size-3",
        icon: "size-9",
        "icon-lg": "size-10 [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </button>
    );
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputContainerClassName?: string
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ inputContainerClassName, className, type, leadingIcon, trailingIcon, ...props }, ref) => {
    return (
      <div
        className={cn("relative w-full", inputContainerClassName)}
        data-slot="input-container"
      >
        {leadingIcon && (
          <span
            data-slot="input-leading-icon"
            className="text-muted-foreground absolute top-1/2 left-3 shrink-0 -translate-y-1/2 [&_svg]:shrink-0 [&_svg:not([class*='pointer-events-'])]:pointer-events-none [&_svg:not([class*='size-'])]:size-4"
          >
            {leadingIcon}
          </span>
        )}
        <input
          type={type}
          data-slot="input"
          className={cn(
            "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/50 aria-invalid:border-destructive",
            leadingIcon && "pl-10",
            trailingIcon && "pr-10",
            className
          )}
          ref={ref}
          {...props}
        />
        {trailingIcon && (
          <span
            data-slot="input-trailing-icon"
            className="text-muted-foreground absolute top-1/2 right-3 shrink-0 -translate-y-1/2 [&_svg]:shrink-0 [&_svg:not([class*='pointer-events-'])]:pointer-events-none [&_svg:not([class*='size-'])]:size-4"
          >
            {trailingIcon}
          </span>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
