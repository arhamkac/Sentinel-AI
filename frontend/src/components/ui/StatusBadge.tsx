import { Badge } from './Badge'
import type { IncidentStatus } from '@/types'
import { cn } from '@/lib/utils'

const statusConfig: Record<IncidentStatus, { label: string; variant: 'danger' | 'warning' | 'primary' | 'success' | 'muted' }> = {
  open:          { label: 'Open',          variant: 'danger' },
  investigating: { label: 'Investigating', variant: 'warning' },
  contained:     { label: 'Contained',     variant: 'primary' },
  resolved:      { label: 'Resolved',      variant: 'success' },
  closed:        { label: 'Closed',        variant: 'muted' },
}

interface StatusBadgeProps {
  status: IncidentStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <Badge variant={config.variant} dot className={cn(className)}>
      {config.label}
    </Badge>
  )
}
