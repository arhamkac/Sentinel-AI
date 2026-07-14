import { Bell, Search, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { useEventsStore } from '@/stores/events.store'

export function Topbar() {
  const { user } = useAuthStore()
  const { liveEvents } = useEventsStore()

  const criticalCount = liveEvents.filter(e => e.severity === 'critical').length
  const hasCritical = criticalCount > 0

  return (
    <header
      className="flex items-center shrink-0"
      style={{
        height: 56,
        padding: '0 32px',
        gap: 16,
        background: 'var(--bg-base)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* ── Search ── */}
      <div
        className="flex items-center cursor-text"
        style={{
          width: 280,
          height: 36,
          padding: '0 12px',
          gap: 8,
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
        }}
      >
        <Search style={{ width: 14, height: 14, color: 'var(--text-muted)', flexShrink: 0 }} />
        <span style={{
          fontSize: 13,
          color: 'var(--text-disabled)',
          userSelect: 'none',
        }}>
          Search incidents, assets...
        </span>
        <span style={{
          marginLeft: 'auto',
          fontSize: 11,
          color: 'var(--text-disabled)',
          background: 'var(--bg-inset)',
          padding: '1px 6px',
          borderRadius: 4,
          border: '1px solid var(--border)',
          fontFamily: 'var(--font-mono)',
        }}>
          ⌘K
        </span>
      </div>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── AI Status ── */}
      <div
        className="hidden md:flex items-center"
        style={{
          gap: 6,
          height: 32,
          padding: '0 10px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--primary-bg)',
          border: '1px solid var(--primary-ring)',
        }}
      >
        <Sparkles style={{ width: 13, height: 13, color: 'var(--primary)' }} />
        <span style={{
          fontSize: 12, fontWeight: 500,
          color: 'var(--primary)',
        }}>
          AI Online
        </span>
      </div>

      {/* ── Notifications ── */}
      <button
        className="relative flex items-center justify-center rounded-lg cursor-pointer transition-colors"
        style={{
          width: 36, height: 36,
          background: hasCritical ? 'var(--danger-bg)' : 'var(--bg-surface)',
          border: `1px solid ${hasCritical ? 'var(--danger-ring)' : 'var(--border)'}`,
          color: hasCritical ? 'var(--danger)' : 'var(--text-muted)',
        }}
      >
        <Bell style={{ width: 16, height: 16 }} />
        {hasCritical && (
          <span
            className="absolute flex items-center justify-center rounded-full"
            style={{
              top: -4, right: -4,
              minWidth: 18, height: 18,
              padding: '0 5px',
              background: 'var(--danger)',
              fontSize: 10, fontWeight: 600,
              color: '#fff',
            }}
          >
            {criticalCount > 9 ? '9+' : criticalCount}
          </span>
        )}
      </button>

      {/* ── Divider ── */}
      <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

      {/* ── User ── */}
      <div className="flex items-center" style={{ gap: 10 }}>
        <div
          className="flex items-center justify-center rounded-md shrink-0"
          style={{
            width: 32, height: 32,
            background: 'var(--primary-bg)',
            border: '1px solid var(--primary-ring)',
            fontSize: 13, fontWeight: 600,
            color: 'var(--primary)',
          }}
        >
          {user?.name?.charAt(0).toUpperCase() ?? 'A'}
        </div>
        <div className="hidden sm:flex flex-col">
          <span style={{
            fontSize: 13, fontWeight: 500,
            color: 'var(--text-primary)',
            lineHeight: 1.2,
          }}>
            {user?.name ?? 'Analyst'}
          </span>
          <span style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            lineHeight: 1.2,
          }}>
            {user?.role ?? 'analyst'}
          </span>
        </div>
      </div>
    </header>
  )
}
