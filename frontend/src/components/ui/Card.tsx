import * as React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean
  hover?: boolean
  variant?: 'default' | 'glass' | 'hud' | 'terminal' | 'danger'
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glow, hover, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.6)]',

        // Variant styles
        variant === 'default' && 'border border-border bg-surface',
        variant === 'glass'   && 'border border-border bg-surface/70 backdrop-blur-xl',
        variant === 'hud'     && 'bg-surface border border-border',
        variant === 'terminal' && 'border border-border bg-bg-2 font-mono terminal-screen',
        variant === 'danger'  && 'border border-danger/20 bg-surface',

        // HUD top border accent
        (variant === 'hud' || variant === 'glass') && '[border-top:1px_solid_rgba(142,221,190,0.25)]',

        hover && 'transition-all duration-200 hover:border-primary/20 hover:[box-shadow:0_8px_40px_rgba(0,0,0,0.7),0_0_0_1px_rgba(142,221,190,0.06)]',
        glow  && 'shadow-[0_0_0_1px_rgba(142,221,190,0.1),0_4px_32px_rgba(0,0,0,0.6),0_0_24px_rgba(142,221,190,0.08)]',

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
      className={cn('text-sm font-semibold text-[#E2E8F0] leading-tight tracking-tight', className)}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-xs text-[#3d566e]', className)} {...props} />
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
    <div ref={ref} className={cn('flex items-center px-6 pb-6 pt-0', className)} {...props} />
  )
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
