import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, AlertTriangle, Network, Brain, Crosshair,
  FileText, Settings, Shield, ChevronRight,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/dashboard',        icon: LayoutDashboard, label: 'Overview' },
  { to: '/incidents',        icon: AlertTriangle,   label: 'Incidents' },
  { to: '/attack-graph',     icon: Network,         label: 'Attack Graph' },
  { to: '/ai-investigation', icon: Brain,           label: 'AI Investigation' },
  { to: '/simulator',        icon: Crosshair,       label: 'Simulator' },
  { to: '/reports',          icon: FileText,         label: 'Reports' },
]

const NAV_BOTTOM = [
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const { pathname } = useLocation()

  const isActive = (to: string) =>
    pathname === to || (to !== '/dashboard' && pathname.startsWith(to + '/'))

  return (
    <aside
      className="flex flex-col h-screen shrink-0"
      style={{
        width: 248,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* ── Logo ── */}
      <div
        className="flex items-center gap-3 shrink-0"
        style={{ height: 56, padding: '0 20px' }}
      >
        <div
          className="flex items-center justify-center rounded-lg shrink-0"
          style={{
            width: 32, height: 32,
            background: 'var(--primary-bg)',
            border: '1px solid var(--primary-ring)',
          }}
        >
          <Shield style={{ width: 16, height: 16, color: 'var(--primary)' }} strokeWidth={1.8} />
        </div>
        <div>
          <p style={{
            fontSize: 14, fontWeight: 600,
            color: 'var(--text-primary)',
            lineHeight: 1.2, letterSpacing: '-0.01em',
          }}>
            Sentinel AI
          </p>
          <p style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            lineHeight: 1.2,
          }}>
            SOC Platform
          </p>
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: 'var(--border)', margin: '0 16px' }} />

      {/* ── Main Navigation ── */}
      <nav className="flex-1 overflow-y-auto" style={{ padding: '12px 12px' }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 500,
            color: 'var(--text-muted)',
            padding: '0 8px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            Navigation
          </span>
        </div>

        <div className="flex flex-col" style={{ gap: 2 }}>
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
            const active = isActive(to)
            return (
              <NavLink
                key={to}
                to={to}
                className="group relative flex items-center rounded-lg transition-colors duration-100"
                style={{
                  height: 36,
                  padding: '0 8px',
                  gap: 10,
                  background: active ? 'var(--primary-bg)' : 'transparent',
                  color: active ? 'var(--primary)' : 'var(--text-secondary)',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => {
                  if (!active) e.currentTarget.style.background = 'var(--bg-hover)'
                }}
                onMouseLeave={e => {
                  if (!active) e.currentTarget.style.background = 'transparent'
                }}
              >
                {active && (
                  <span
                    className="absolute left-0 rounded-r"
                    style={{
                      top: 6, bottom: 6, width: 3,
                      background: 'var(--primary)',
                      borderRadius: '0 3px 3px 0',
                    }}
                  />
                )}
                <Icon style={{ width: 16, height: 16, flexShrink: 0 }} />
                <span style={{
                  fontSize: 13, fontWeight: active ? 500 : 400,
                  whiteSpace: 'nowrap',
                }}>
                  {label}
                </span>
                {active && (
                  <ChevronRight
                    style={{
                      width: 14, height: 14,
                      marginLeft: 'auto',
                      opacity: 0.5,
                    }}
                  />
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>

      {/* ── Bottom Nav ── */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)' }}>
        {NAV_BOTTOM.map(({ to, icon: Icon, label }) => {
          const active = isActive(to)
          return (
            <NavLink
              key={to}
              to={to}
              className="flex items-center rounded-lg transition-colors duration-100"
              style={{
                height: 36,
                padding: '0 8px',
                gap: 10,
                background: active ? 'var(--primary-bg)' : 'transparent',
                color: active ? 'var(--primary)' : 'var(--text-secondary)',
                textDecoration: 'none',
              }}
              onMouseEnter={e => {
                if (!active) e.currentTarget.style.background = 'var(--bg-hover)'
              }}
              onMouseLeave={e => {
                if (!active) e.currentTarget.style.background = 'transparent'
              }}
            >
              <Icon style={{ width: 16, height: 16, flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: active ? 500 : 400 }}>
                {label}
              </span>
            </NavLink>
          )
        })}

        {/* ── User Block ── */}
        <div
          className="flex items-center rounded-lg"
          style={{
            marginTop: 8,
            padding: '8px',
            gap: 10,
            background: 'var(--bg-inset)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
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
            S
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{
              fontSize: 13, fontWeight: 500,
              color: 'var(--text-primary)',
              lineHeight: 1.3,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              Security Ops
            </p>
            <p style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              lineHeight: 1.3,
            }}>
              Analyst
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
