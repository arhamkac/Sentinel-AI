import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-[#64748B] pointer-events-none flex items-center">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-10 rounded-lg bg-[#071022] border border-[#162030] text-[#E2E8F0] text-sm',
              'placeholder:text-[#3d566e] pl-3 pr-3',
              'transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30 focus:border-[#00E5FF]/40',
              'hover:border-[#243650]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-[#FF4D6D]/50 focus:ring-[#FF4D6D]/30',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-[#3d566e] flex items-center">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-[#FF4D6D]">{error}</p>}
        {hint && !error && <p className="text-xs text-[#3d566e]">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
