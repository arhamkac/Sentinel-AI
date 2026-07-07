import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium transition-colors border',
  {
    variants: {
      variant: {
        default:   'bg-[#1E293B] text-[#E5E7EB] border-[#243044]',
        primary:   'bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/20',
        critical:  'bg-[#FF4D6D]/10 text-[#FF4D6D] border-[#FF4D6D]/20',
        high:      'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/20',
        medium:    'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
        low:       'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20',
        info:      'bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/20',
        success:   'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20',
        warning:   'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
        danger:    'bg-[#FF4D6D]/10 text-[#FF4D6D] border-[#FF4D6D]/20',
        muted:     'bg-transparent text-[#64748B] border-[#1E293B]',
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
