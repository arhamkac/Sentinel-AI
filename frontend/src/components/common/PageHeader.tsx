/**
 * PageHeader — Consistent page title bar used across all pages.
 * Replaces the duplicated h1 + description + optional action pattern.
 */
import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  /** Optional right-aligned action slot (buttons, badges, etc.) */
  actions?: ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">{title}</h1>
        {description && (
          <p className="text-sm text-[var(--text-muted)] mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}
