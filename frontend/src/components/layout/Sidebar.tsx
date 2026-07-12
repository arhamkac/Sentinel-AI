import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Network, ShieldCheck, ClipboardList, Settings,
  ChevronLeft, ChevronRight, Hexagon, Shield, Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui.store'
import { Tooltip } from '@/components/ui'

const NAV = [
  { to: '/dashboard',        icon: LayoutDashboard, label: 'Command Center' },
  { to: '/incidents',        icon: Network,         label: 'Incidents'      },
  { to: '/attack-graph',     icon: ShieldCheck,     label: 'Attack Graph'   },
  { to: '/ai-investigation', icon: ClipboardList,   label: 'Investigation'  },
  { to: '/simulator',        icon: Activity,        label: 'Simulator'      },
  { to: '/settings',         icon: Settings,        label: 'Settings'       },
]

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { pathname } = useLocation()
  const W = sidebarCollapsed ? 72 : 264

  return (
    <motion.aside
      initial={false}
      animate={{ width: W }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-screen shrink-0 z-30 overflow-visible"
      style={{ background: 'var(--bg-chrome)', borderRight: '1px solid var(--bd-default)', boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.02)' }}
    >
      {/* ── Logo ────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 shrink-0"
        style={{ height: 72, borderBottom: '1px solid var(--bd-hairline)' }}
      >
        {/* icon */}
        <div
          className="flex items-center justify-center rounded-xl shrink-0"
          style={{
            width     : 36, height: 36,
            background: 'var(--accent-bg)',
            border    : '1px solid var(--accent-ring)',
          }}
        >
          <Hexagon style={{ width: 17, height: 17, color: 'var(--accent)' }} strokeWidth={1.5} />
        </div>

        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1,  x:  0 }}
              exit  ={{ opacity: 0,  x: -8 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--tx-high)', letterSpacing: '0.06em', lineHeight: 1.2 }}>
                SENTINEL AI
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent)', letterSpacing: '0.20em', textTransform: 'uppercase', marginTop: 3 }}>
                OPERATIONAL
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden" style={{ padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {NAV.map(({ to, icon: Icon, label }) => {
          const active = pathname === to || (to !== '/dashboard' && pathname.startsWith(to + '/'))

          const item = (
            <NavLink
              key={to}
              to={to}
              className={cn(
                'group relative flex items-center transition-all duration-150',
                sidebarCollapsed ? 'justify-center rounded-xl' : 'rounded-xl px-3 gap-3',
              )}
              style={{
                height     : 42,
                background : active ? 'var(--accent-bg)' : 'transparent',
                border     : `1px solid ${active ? 'var(--accent-ring)' : 'transparent'}`,
                padding    : sidebarCollapsed ? '0' : '0 12px',
              }}
            >
              {/* active pill */}
              {active && !sidebarCollapsed && (
                <span
                  className="absolute left-0 rounded-r-full"
                  style={{ top: 8, bottom: 8, width: 3, background: 'var(--accent)' }}
                />
              )}

              <Icon style={{
                width: 16, height: 16, flexShrink: 0,
                color: active ? 'var(--accent)' : 'var(--tx-low)',
                transition: 'color 0.15s',
              }} />

              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    style={{
                      fontSize  : 13,
                      fontWeight: active ? 500 : 400,
                      color     : active ? 'var(--accent)' : 'var(--tx-mid)',
                      whiteSpace: 'nowrap',
                      transition: 'color 0.15s',
                    }}
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          )

          return sidebarCollapsed
            ? <Tooltip key={to} content={label} side="right">{item}</Tooltip>
            : item
        })}
      </nav>

      {/* ── User block ──────────────────────────────────────── */}
      <div style={{ padding: '10px 8px', borderTop: '1px solid var(--bd-hairline)' }}>
        <AnimatePresence mode="wait">
          {!sidebarCollapsed ? (
            <motion.div
              key="exp"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3 rounded-xl px-3"
              style={{
                height    : 48,
                background: 'var(--bg-card)',
                border    : '1px solid var(--bd-hairline)',
              }}
            >
              <div className="flex items-center justify-center rounded-lg shrink-0"
                style={{ width: 34, height: 34, background: 'var(--accent-bg)', border: '1px solid var(--accent-ring)' }}>
                <Shield style={{ width: 13, height: 13, color: 'var(--accent)' }} />
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx-high)', lineHeight: 1.3 }}>Operator 09</p>
                <p style={{ fontSize: 10, color: 'var(--tx-low)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1.3 }}>Level 4 Access</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="col"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex justify-center"
            >
              <div className="flex items-center justify-center rounded-xl"
                style={{ width: 44, height: 44, background: 'var(--bg-card)', border: '1px solid var(--bd-hairline)' }}>
                <Shield style={{ width: 15, height: 15, color: 'var(--accent)' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Collapse toggle ─────────────────────────────────── */}
      <button
        onClick={toggleSidebar}
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute z-50 flex items-center justify-center rounded-full cursor-pointer transition-all duration-150"
        style={{
          top      : 76,
          right    : -12,
          width    : 24, height: 24,
          background: 'var(--bg-card)',
          border   : '1px solid var(--bd-default)',
          color    : 'var(--tx-low)',
          boxShadow: 'var(--sh-sm)',
        }}
        onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = 'var(--accent-ring)'; b.style.color = 'var(--accent)' }}
        onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = 'var(--bd-default)'; b.style.color = 'var(--tx-low)' }}
      >
        {sidebarCollapsed ? <ChevronRight style={{ width: 12, height: 12 }} /> : <ChevronLeft style={{ width: 12, height: 12 }} />}
      </button>
    </motion.aside>
  )
}
