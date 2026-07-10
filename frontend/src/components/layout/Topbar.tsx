import { Bell, Search, Server, Cpu, Lock, Menu } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { useEventsStore } from '@/stores/events.store'
import { useUIStore } from '@/stores/ui.store'
import { Tooltip } from '@/components/ui'

function HudChip({ icon, label, value, valColor }: {
  icon: React.ReactNode; label: string; value: string; valColor?: string
}) {
  return (
    <div
      className="hidden md:flex items-center gap-2 select-none"
      style={{
        height     : 32,
        padding    : '0 12px',
        borderRadius: 8,
        background : 'var(--bg-inset)',
        border     : '1px solid var(--bd-default)',
        fontFamily : 'var(--font-mono)',
        fontSize   : 11,
        gap        : 7,
      }}
    >
      <span style={{ color: 'var(--tx-low)', display: 'flex' }}>{icon}</span>
      {label && <span style={{ color: 'var(--tx-low)' }}>{label}</span>}
      <span style={{ fontWeight: 600, color: valColor ?? 'var(--accent)' }}>{value}</span>
    </div>
  )
}

export function Topbar() {
  const { user }                  = useAuthStore()
  const { liveEvents }            = useEventsStore()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  const criticalCount = liveEvents.filter(e => e.severity === 'critical').length
  const hasCritical   = criticalCount > 0
  const hasHigh       = liveEvents.some(e => e.severity === 'high')
  const threatLevel   = hasCritical ? 'CRITICAL' : hasHigh ? 'HIGH' : 'LOW'
  const threatColor   = hasCritical ? 'var(--danger)' : hasHigh ? 'var(--warn)' : 'var(--accent)'

  return (
    <header
      className="flex items-center shrink-0 relative"
      style={{
        height       : 76,
        padding      : '0 24px',
        gap          : 12,
        background   : 'var(--bg-chrome)',
        borderBottom : '1px solid var(--bd-default)',
      }}
    >
      {/* hairline glow under header */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 pointer-events-none"
        style={{
          left      : '20%', right: '20%', height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(0,217,180,0.25), transparent)',
        }}
      />

      {/* sidebar toggle (collapsed only) */}
      {sidebarCollapsed && (
        <Tooltip content="Open sidebar" side="bottom">
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center rounded-lg cursor-pointer transition-all shrink-0"
            style={{ width: 32, height: 32, border: '1px solid var(--bd-default)', color: 'var(--tx-low)' }}
          >
            <Menu style={{ width: 15, height: 15 }} />
          </button>
        </Tooltip>
      )}

      {/* search */}
      <div
        className="flex items-center shrink-0 cursor-text"
        style={{
          width       : 220,
          height      : 36,
          padding     : '0 12px',
          gap         : 8,
          borderRadius: 10,
          background  : 'var(--bg-inset)',
          border      : '1px solid var(--bd-default)',
        }}
      >
        <Search style={{ width: 13, height: 13, color: 'var(--tx-low)', flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: 'var(--tx-disabled)', fontFamily: 'var(--font-mono)', userSelect: 'none' }}>
          Global Mesh Search...
        </span>
      </div>

      {/* HUD chips – centred */}
      <div className="flex-1 hidden items-center justify-center lg:flex" style={{ gap: 8 }}>
        <HudChip icon={<Server style={{ width: 12, height: 12 }} />} label="NODES:"   value="4,521" />
        <HudChip icon={<Cpu    style={{ width: 12, height: 12 }} />} label="LATENCY:" value="12ms"  valColor="var(--warn)" />
        <HudChip icon={<Lock   style={{ width: 12, height: 12 }} />} label=""         value="AES-256" />
      </div>

      {/* right: bell + divider + user */}
      <div className="flex items-center shrink-0" style={{ gap: 10 }}>

        {/* bell */}
        <Tooltip content={hasCritical ? `${criticalCount} critical alert${criticalCount > 1 ? 's' : ''}` : 'No alerts'} side="bottom">
          <button
            className="relative flex items-center justify-center rounded-lg cursor-pointer transition-all"
            style={{
              width     : 32, height: 32,
              background: hasCritical ? 'var(--danger-bg)' : 'transparent',
              border    : `1px solid ${hasCritical ? 'var(--danger-ring)' : 'var(--bd-default)'}`,
              color     : hasCritical ? 'var(--danger)' : 'var(--tx-low)',
            }}
          >
            <Bell style={{ width: 15, height: 15 }} />
            {hasCritical && (
              <span
                className="absolute flex items-center justify-center rounded-full"
                style={{
                  top: -6, right: -6,
                  minWidth: 16, height: 16,
                  padding   : '0 4px',
                  background: 'var(--danger)',
                  fontSize  : 9, fontWeight: 700,
                  color     : '#fff',
                }}
              >
                {criticalCount > 9 ? '9+' : criticalCount}
              </span>
            )}
          </button>
        </Tooltip>

        {/* divider */}
        <div style={{ width: 1, height: 24, background: 'var(--bd-default)' }} />

        {/* user */}
        <div className="flex items-center" style={{ gap: 10 }}>
          {/* avatar */}
          <div
            className="flex items-center justify-center rounded-lg shrink-0"
            style={{
              width     : 32, height: 32,
              background: 'var(--accent-bg)',
              border    : '1px solid var(--accent-ring)',
              fontFamily: 'var(--font-mono)',
              fontSize  : 13, fontWeight: 700,
              color     : 'var(--accent)',
            }}
          >
            {user?.name?.charAt(0).toUpperCase() ?? 'D'}
          </div>

          <div className="hidden sm:flex flex-col" style={{ gap: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx-high)', lineHeight: 1 }}>
              {user?.name ?? 'Demo Analyst'}
            </span>
            <span style={{ fontSize: 10, color: threatColor, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', lineHeight: 1 }}>
              THREAT LEVEL: {threatLevel}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
