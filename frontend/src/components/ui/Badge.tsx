/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium transition-colors border',
  {
    variants: {
      variant: {
        default:   'bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border)]',
        primary:   'bg-[var(--primary-bg)] text-[var(--primary)] border-[var(--primary-ring)]',
        critical:  'bg-[var(--danger-bg)] text-[var(--danger)] border-[var(--danger-ring)]',
        high:      'bg-[var(--warning-bg)] text-[var(--warning)] border-[var(--warning-ring)]',
        medium:    'bg-[var(--warning-bg)] text-[var(--warning)] border-[var(--warning-ring)]',
        low:       'bg-[var(--success-bg)] text-[var(--success)] border-[var(--success-ring)]',
        info:      'bg-[var(--info-bg)] text-[var(--info)] border-[var(--info-ring)]',
        success:   'bg-[var(--success-bg)] text-[var(--success)] border-[var(--success-ring)]',
        warning:   'bg-[var(--warning-bg)] text-[var(--warning)] border-[var(--warning-ring)]',
        danger:    'bg-[var(--danger-bg)] text-[var(--danger)] border-[var(--danger-ring)]',
        muted:     'bg-transparent text-[var(--text-muted)] border-[var(--border)]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-current shrink-0"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}

export { Badge, badgeVariants }
