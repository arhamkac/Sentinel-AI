/**
 * Severity Style Utility
 * Single source of truth for severity → CSS variable mapping.
 * Replaces duplicated sevColor/sevBg/sevRing ternary chains.
 */
import type { Severity, IncidentStatus } from '@/types'

export interface SeverityStyles {
  color: string
  bg: string
  ring: string
}

const SEVERITY_MAP: Record<Severity, SeverityStyles> = {
  critical: { color: 'var(--danger)',  bg: 'var(--danger-bg)',  ring: 'var(--danger-ring)' },
  high:     { color: 'var(--warning)', bg: 'var(--warning-bg)', ring: 'var(--warning-ring)' },
  medium:   { color: 'var(--warning)', bg: 'var(--warning-bg)', ring: 'var(--warning-ring)' },
  low:      { color: 'var(--success)', bg: 'var(--success-bg)', ring: 'var(--success-ring)' },
  info:     { color: 'var(--info)',    bg: 'var(--info-bg)',    ring: 'var(--info-ring)' },
}

const DEFAULT_STYLES: SeverityStyles = {
  color: 'var(--primary)',
  bg: 'var(--primary-bg)',
  ring: 'var(--primary-ring)',
}

/**
 * Returns CSS variable references for a given severity level.
 * Use in style={{ color: s.color, backgroundColor: s.bg, borderColor: s.ring }}
 */
export function getSeverityStyles(severity?: string): SeverityStyles {
  if (!severity) return DEFAULT_STYLES
  return SEVERITY_MAP[severity.toLowerCase() as Severity] ?? DEFAULT_STYLES
}

/**
 * Status-to-style mapping for incident statuses.
 */
const STATUS_MAP: Record<IncidentStatus, SeverityStyles> = {
  open:          { color: 'var(--danger)',  bg: 'var(--danger-bg)',  ring: 'var(--danger-ring)' },
  investigating: { color: 'var(--warning)', bg: 'var(--warning-bg)', ring: 'var(--warning-ring)' },
  contained:     { color: 'var(--primary)', bg: 'var(--primary-bg)', ring: 'var(--primary-ring)' },
  resolved:      { color: 'var(--success)', bg: 'var(--success-bg)', ring: 'var(--success-ring)' },
  closed:        { color: 'var(--text-muted)', bg: 'var(--bg-inset)', ring: 'var(--border)' },
}

export function getStatusStyles(status?: string): SeverityStyles {
  if (!status) return DEFAULT_STYLES
  return STATUS_MAP[status.toLowerCase() as IncidentStatus] ?? DEFAULT_STYLES
}
