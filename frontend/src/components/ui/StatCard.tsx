import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ElementType
  /** CSS color class for text, e.g. 'text-[var(--primary)]' */
  colorClass?: string
  /** CSS background class for icon container, e.g. 'bg-[var(--primary-bg)]' */
  bgClass?: string
  /** Optional suffix or change indicator */
  suffix?: ReactNode
}

/**
 * Reusable KPI / stat card used across Dashboard, Incidents, and Threat Intel pages.
 * Replaces 3 inline implementations of the same pattern.
 */
export function StatCard({ label, value, icon: Icon, colorClass = 'text-[var(--text-primary)]', bgClass = 'bg-[var(--bg-inset)]', suffix }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${bgClass}`}>
        <Icon className={`w-5 h-5 ${colorClass}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">{label}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <span className={`text-xl font-bold font-mono ${colorClass}`}>{value}</span>
          {suffix}
        </div>
      </div>
    </div>
  )
}
