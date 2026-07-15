/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] disabled:pointer-events-none disabled:opacity-40 select-none',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--primary)] text-[var(--bg-base)] font-semibold hover:bg-[var(--primary-dim)] shadow-[0_0_20px_var(--primary-ring)] hover:shadow-[0_0_28px_var(--primary-ring)] active:scale-[0.98]',
        secondary:
          'bg-[var(--border)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--bg-hover)] hover:border-[var(--primary-ring)] active:scale-[0.98]',
        outline:
          'border border-[var(--border)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-hover)] hover:border-[var(--primary-ring)] active:scale-[0.98]',
        ghost:
          'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] active:scale-[0.98]',
        danger:
          'bg-[var(--danger)] text-white font-semibold hover:opacity-90 shadow-[0_0_20px_var(--danger-ring)] hover:shadow-[0_0_28px_var(--danger-ring)] active:scale-[0.98]',
        'danger-outline':
          'border border-[var(--danger)] bg-transparent text-[var(--danger)] hover:bg-[var(--danger-bg)] active:scale-[0.98]',
        success:
          'bg-[var(--success)] text-white font-semibold hover:opacity-90 shadow-[0_0_20px_var(--success-ring)] active:scale-[0.98]',
        'success-outline':
          'border border-[var(--success)] bg-transparent text-[var(--success)] hover:bg-[var(--success-bg)] active:scale-[0.98]',
        link:
          'bg-transparent text-[var(--primary)] underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm:   'h-8  px-3   text-xs',
        md:   'h-9  px-4   text-sm',
        lg:   'h-10 px-5   text-sm',
        xl:   'h-12 px-6   text-base',
        icon: 'h-9  w-9',
        'icon-sm': 'h-7 w-7',
        'icon-lg': 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4 shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
