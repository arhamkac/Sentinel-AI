import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, AlertTriangle, GitBranch, Brain, Shield,
  Zap, FileText, Activity, Settings, ChevronLeft, ChevronRight,
  Radio, Cpu, Lock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui.store'
import { Tooltip } from '@/components/ui'

const NAV_SECTIONS = [
  {
    label: 'MONITORING',
    items: [
      { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard',        badge: null },
      { to: '/incidents',    icon: AlertTriangle,   label: 'Incidents',        badge: '7' },
      { to: '/attack-graph', icon: GitBranch,       label: 'Attack Graph',     badge: null },
    ],
  },
  {
    label: 'ANALYSIS',
    items: [
      { to: '/ai-investigation', icon: Brain,  label: 'AI Investigation', badge: null },
      { to: '/mitre',            icon: Shield, label: 'MITRE ATT&CK',    badge: null },
      { to: '/threat-intel',     icon: Zap,    label: 'Threat Intel',     badge: null },
    ],
  },
  {
    label: 'TOOLS',
    items: [
      { to: '/reports',    icon: FileText,  label: 'Reports',   badge: null },
      { to: '/simulator',  icon: Activity,  label: 'Simulator', badge: null },
    ],
  },
]

const BOTTOM_ITEMS = [
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const location = useLocation()

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 64 : 230 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-screen bg-[#040d1a] border-r border-[#162030] shrink-0 z-30 overflow-hidden"
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00E5FF]/60 to-transparent" />

      {/* Subtle background glow */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-[#00E5FF]/[0.03] to-transparent pointer-events-none" />

      {/* Logo */}
      <div className="flex items-center h-16 px-3.5 border-b border-[#162030] overflow-hidden shrink-0">
        <div className="flex items-center gap-3 shrink-0">
          {/* Animated logo icon */}
          <div className="relative w-9 h-9 shrink-0">
            {/* Outer pulse ring */}
            <div className="absolute inset-0 rounded-xl bg-[#00E5FF]/10 blur-md animate-[pulse_3s_ease-in-out_infinite]" />
            {/* Icon container */}
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#0c1828] to-[#071022] border border-[#00E5FF]/30 flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.15)]">
              <Radio className="w-4.5 h-4.5 text-[#00E5FF]" style={{ width: 18, height: 18 }} />
            </div>
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-[#E2E8F0] whitespace-nowrap tracking-wide">Sentinel</span>
                  <span className="text-sm font-bold whitespace-nowrap" style={{ background: 'linear-gradient(135deg,#00E5FF,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>AI</span>
                </div>
                <p className="text-[10px] text-[#3d566e] whitespace-nowrap font-mono tracking-widest uppercase">Cyber Intelligence</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto overflow-x-hidden space-y-1">
        {NAV_SECTIONS.map(({ label, items }) => (
          <div key={label} className="mb-1">
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-2 pt-3 pb-1.5"
                >
                  <span className="text-[9px] font-semibold tracking-[0.15em] text-[#3d566e] uppercase font-mono">
                    {label}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            {sidebarCollapsed && <div className="my-2 mx-auto w-5 h-[1px] bg-[#162030]" />}
            <div className="space-y-0.5">
              {items.map(({ to, icon: Icon, label: itemLabel, badge }) => {
                const isActive = location.pathname === to || location.pathname.startsWith(to + '/')
                const item = (
                  <NavLink
                    key={to}
                    to={to}
                    className={cn(
                      'relative flex items-center gap-2.5 h-9 px-2.5 rounded-lg text-sm transition-all duration-150 group overflow-hidden',
                      isActive
                        ? 'bg-[#00E5FF]/[0.08] text-[#00E5FF] border border-[#00E5FF]/20'
                        : 'text-[#8FA3BF] hover:bg-[#0c1828] hover:text-[#E2E8F0] border border-transparent'
                    )}
                  >
                    {/* Active left accent bar */}
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Icon
                      style={{ width: 15, height: 15 }}
                      className={cn(
                        'shrink-0 transition-colors',
                        isActive ? 'text-primary' : 'text-[#3d566e] group-hover:text-[#8FA3BF]'
                      )}
                    />
                    <AnimatePresence>
                      {!sidebarCollapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.1 }}
                          className="whitespace-nowrap font-medium text-[13px] flex-1"
                        >
                          {itemLabel}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {/* Badge */}
                    {badge && !sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-danger/15 text-danger border border-danger/20 min-w-[18px] text-center"
                      >
                        {badge}
                      </motion.span>
                    )}
                  </NavLink>
                )
                return sidebarCollapsed ? (
                  <Tooltip key={to} content={itemLabel} side="right">{item}</Tooltip>
                ) : item
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="shrink-0 border-t border-border">
        {/* System integrity */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3 py-2.5"
            >
              <div className="rounded-lg bg-surface border border-border p-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Cpu style={{ width: 11, height: 11 }} className="text-primary" />
                    <span className="text-[9px] font-mono text-[#3d566e] uppercase tracking-widest">System Integrity</span>
                  </div>
                  <span className="text-[9px] font-bold text-success font-mono">99.7%</span>
                </div>
                <div className="h-1 rounded-full bg-border overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-success" style={{ width: '99.7%' }} />
                </div>
                <div className="flex items-center gap-1 mt-1.5">
                  <Lock style={{ width: 9, height: 9 }} className="text-[#3d566e]" />
                  <span className="text-[9px] font-mono text-[#3d566e]">AES-256 · STABLE</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings + bottom items */}
        <div className="py-2 px-2 space-y-0.5">
          {BOTTOM_ITEMS.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname.startsWith(to)
            const item = (
              <NavLink
                key={to}
                to={to}
                className={cn(
                  'flex items-center gap-2.5 h-9 px-2.5 rounded-lg text-sm transition-all duration-150 group border',
                  isActive
                    ? 'bg-primary/[0.08] text-primary border-primary/20'
                    : 'text-[#8FA3BF] hover:bg-surface-2 hover:text-[#E2E8F0] border-transparent'
                )}
              >
                <Icon style={{ width: 15, height: 15 }} className={cn('shrink-0', isActive ? 'text-primary' : 'text-[#3d566e] group-hover:text-[#8FA3BF]')} />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="whitespace-nowrap font-medium text-[13px]"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            )
            return sidebarCollapsed ? (
              <Tooltip key={to} content={label} side="right">{item}</Tooltip>
            ) : item
          })}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-surface border border-border-3 flex items-center justify-center text-[#3d566e] hover:text-primary hover:border-primary/40 hover:shadow-[0_0_12px_var(--color-primary)] transition-all z-40 cursor-pointer"
      >
        {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
  )
}
