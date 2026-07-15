/**
 * EmptyState — Consistent empty/no-results component.
 * Replaces inline empty state divs scattered across pages.
 */
import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  icon?: ReactNode
  title?: string
  description?: string
  className?: string
}

export function EmptyState({
  icon,
  title = 'Nothing here yet',
  description = 'No data to display.',
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 p-8 text-center 
        border border-[var(--border)] rounded-xl bg-[var(--bg-surface)] ${className}`}
    >
      <div className="text-[var(--text-muted)]">
        {icon ?? <Inbox className="w-8 h-8" />}
      </div>
      <p className="text-sm font-medium text-[var(--text-secondary)]">{title}</p>
      <p className="text-xs text-[var(--text-muted)] max-w-xs">{description}</p>
    </div>
  )
}
