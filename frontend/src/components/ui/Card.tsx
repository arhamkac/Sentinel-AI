import * as React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean
  hover?: boolean
  variant?: 'default' | 'glass' | 'inset'
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glow, hover, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-[var(--radius-lg)] shadow-sm transition-all duration-200 overflow-hidden',
        
        // Variants
        variant === 'default' && 'bg-[var(--bg-surface)]/70 backdrop-blur-md border border-[var(--border)]',
        variant === 'glass'   && 'bg-[var(--bg-surface)]/40 backdrop-blur-xl border border-[var(--border)]',
        variant === 'inset'   && 'bg-[var(--bg-inset)]/70 backdrop-blur-sm border border-[var(--border)] rounded-[var(--radius-md)]',

        hover && 'hover:border-[var(--border-strong)] hover:shadow-md hover:bg-[var(--bg-surface)]/90',
        glow  && 'shadow-[0_0_16px_var(--primary-ring)]',

        className
      )}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col gap-1 p-6 pb-0', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-sm font-semibold text-[var(--text-primary)] leading-tight tracking-tight', className)}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-xs text-[var(--text-muted)]', className)} {...props} />
  )
)
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-5', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  )
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
