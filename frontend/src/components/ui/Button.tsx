import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060B16] disabled:pointer-events-none disabled:opacity-40 select-none',
  {
    variants: {
      variant: {
        default:
          'bg-[#00E5FF] text-[#060B16] font-semibold hover:bg-[#00b8cc] shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_28px_rgba(0,229,255,0.45)] active:scale-[0.98]',
        secondary:
          'bg-[#1E293B] text-[#E5E7EB] border border-[#1E293B] hover:bg-[#243044] hover:border-[#00E5FF]/30 active:scale-[0.98]',
        outline:
          'border border-[#1E293B] bg-transparent text-[#E5E7EB] hover:bg-[#1E293B] hover:border-[#00E5FF]/40 active:scale-[0.98]',
        ghost:
          'bg-transparent text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#E5E7EB] active:scale-[0.98]',
        danger:
          'bg-[#FF4D6D] text-white font-semibold hover:bg-[#e03055] shadow-[0_0_20px_rgba(255,77,109,0.25)] hover:shadow-[0_0_28px_rgba(255,77,109,0.4)] active:scale-[0.98]',
        'danger-outline':
          'border border-[#FF4D6D]/40 bg-transparent text-[#FF4D6D] hover:bg-[#FF4D6D]/10 active:scale-[0.98]',
        link:
          'bg-transparent text-[#00E5FF] underline-offset-4 hover:underline p-0 h-auto',
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
