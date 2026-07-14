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
      className="flex items-center shrink-0 relative z-20"
      style={{
        height: 56,
        padding: '0 32px',
        gap: 16,
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* ── Search ── */}
      <div
        onClick={() => alert("Search functionality coming soon!")}
        className="flex items-center cursor-pointer transition-colors hover:bg-[var(--bg-inset)] hover:border-[var(--primary-dim)]"
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
        onClick={() => alert(hasCritical ? `You have ${criticalCount} critical alerts!` : "No new alerts")}
        className="relative flex items-center justify-center rounded-lg cursor-pointer transition-colors hover:opacity-80 active:scale-95"
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
              background: 'var(--danger)',
              color: 'var(--bg-base)',
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            {criticalCount}
          </span>
        )}
      </button>

      {/* ── Divider ── */}
      <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

      {/* ── User Menu ── */}
      <div
        onClick={() => alert(`Logged in as ${user?.name || 'User'}. Profile settings coming soon!`)}
        className="flex items-center gap-3 cursor-pointer p-1 rounded-lg transition-colors hover:bg-[var(--bg-inset)] active:scale-95"
      >
        <div className="flex flex-col items-end hidden sm:flex">
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', lineHeight: '16px' }}>
            {user?.name || 'Admin'}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: '14px' }}>
            {user?.role || 'SOC Analyst'}
          </span>
        </div>
        <div
          className="flex items-center justify-center rounded-full shrink-0"
          style={{
            width: 36, height: 36,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            fontSize: 14, fontWeight: 600,
          }}
        >
          {user?.name?.charAt(0).toUpperCase() || 'A'}
        </div>
      </div>
    </header>
  )
}
