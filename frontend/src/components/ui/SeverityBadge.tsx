import { Badge } from './Badge'
import type { Severity } from '@/types'

const severityVariantMap: Record<Severity, 'critical' | 'high' | 'medium' | 'low' | 'info'> = {
  critical: 'critical',
  high:     'high',
  medium:   'medium',
  low:      'low',
  info:     'info',
}

interface SeverityBadgeProps {
  severity: Severity
  dot?: boolean
  className?: string
}

export function SeverityBadge({ severity, dot, className }: SeverityBadgeProps) {
  const variant = severityVariantMap[severity] ?? 'info'
  return (
    <Badge variant={variant} dot={dot} className={className}>
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </Badge>
  )
}
