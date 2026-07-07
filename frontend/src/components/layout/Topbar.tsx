import { Bell, Search, Wifi, WifiOff, Server, Clock, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { useEventsStore } from '@/stores/events.store'
import { Button } from '@/components/ui'
import { Tooltip } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useLocation } from 'react-router-dom'

interface TopbarProps {
  title?: string
  description?: string
}

const PAGE_META: Record<string, { label: string; sub: string }> = {
  '/dashboard':        { label: 'Dashboard',        sub: 'Live threat monitoring overview' },
  '/incidents':        { label: 'Incidents',         sub: 'Active security incidents' },
  '/attack-graph':     { label: 'Attack Graph',      sub: 'Visual attack chain mapping' },
  '/ai-investigation': { label: 'AI Investigation',  sub: 'Autonomous threat analysis' },
  '/mitre':            { label: 'MITRE ATT&CK',      sub: 'Technique mapping framework' },
  '/threat-intel':     { label: 'Threat Intelligence', sub: 'IOC & threat actor data' },
  '/reports':          { label: 'Reports',           sub: 'Incident & executive reports' },
  '/simulator':        { label: 'Attack Simulator',  sub: 'Test detection capabilities' },
  '/settings':         { label: 'Settings',          sub: 'Platform configuration' },
}

export function Topbar({ title, description }: TopbarProps) {
  const { user, logout } = useAuthStore()
  const { connectionStatus, liveEvents } = useEventsStore()
  const location = useLocation()

  const criticalCount = liveEvents.filter(e => e.severity === 'critical').length

  // Resolve page meta
  const pagePath = Object.keys(PAGE_META).find(k => location.pathname.startsWith(k)) ?? ''
  const pageMeta = PAGE_META[pagePath]
  const pageLabel = title ?? pageMeta?.label ?? 'Sentinel AI'
  const pageDesc  = description ?? pageMeta?.sub ?? ''

  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <header className="h-14 flex items-center justify-between px-5 border-b border-border bg-bg-2/90 backdrop-blur-sm sticky top-0 z-20 shrink-0">
      {/* Subtle bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/15 to-transparent" />

      {/* Left — page title */}
      <div className="flex flex-col justify-center min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-bold text-[#E2E8F0] leading-tight tracking-tight truncate">{pageLabel}</h1>
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-[#3d566e] uppercase tracking-wider">
            <span className="opacity-40">//</span>
            <span>SENTINEL AI</span>
          </div>
        </div>
        {pageDesc && <p className="text-[11px] text-[#3d566e] truncate font-mono">{pageDesc}</p>}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 shrink-0">
        {/* HUD system chips */}
        <div className="hidden lg:flex items-center gap-1.5">
          {/* Nodes */}
          <div className="flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[10px] font-mono font-medium border border-border bg-surface text-[#3d566e]">
            <Server className="w-3 h-3 text-primary/60" />
            <span className="text-[#8FA3BF]">NODES:</span>
            <span className="text-primary">4,521</span>
          </div>
          {/* Latency */}
          <div className="flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[10px] font-mono font-medium border border-border bg-surface text-[#3d566e]">
            <Clock className="w-3 h-3 text-warning/60" />
            <span className="text-[#8FA3BF]">LATENCY:</span>
            <span className="text-warning">12ms</span>
          </div>
          {/* Encryption */}
          <div className="flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[10px] font-mono font-medium border border-border bg-surface text-[#3d566e]">
            <ShieldCheck className="w-3 h-3 text-success/60" />
            <span className="text-success">AES-256</span>
          </div>
        </div>

        {/* Separator */}
        <div className="hidden lg:block w-px h-5 bg-border" />

        {/* WS Status */}
        <Tooltip content={`Stream: ${connectionStatus}`} side="bottom">
          <div className={cn(
            'flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[10px] font-mono font-medium border transition-colors',
            connectionStatus === 'connected'
              ? 'border-success/20 bg-success/5 text-success'
              : connectionStatus === 'connecting'
              ? 'border-warning/20 bg-warning/5 text-warning'
              : 'border-danger/20 bg-danger/5 text-danger'
          )}>
            {connectionStatus === 'connected' ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_6px_var(--color-success)] animate-pulse" />
                <Wifi className="w-3 h-3" />
                <span className="hidden sm:inline">LIVE</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                <span className="hidden sm:inline uppercase">{connectionStatus}</span>
              </>
            )}
          </div>
        </Tooltip>

        {/* Notifications */}
        <Tooltip content={criticalCount > 0 ? `${criticalCount} critical alert${criticalCount > 1 ? 's' : ''}` : 'No critical alerts'} side="bottom">
          <button
            className={cn(
              'relative w-8 h-8 rounded-lg flex items-center justify-center transition-all border cursor-pointer',
              criticalCount > 0
                ? 'bg-danger/10 border-danger/25 text-danger animate-[danger-pulse_2s_ease-in-out_infinite]'
                : 'bg-transparent border-border text-[#3d566e] hover:bg-surface hover:text-[#8FA3BF]'
            )}
          >
            <Bell className="w-4 h-4" />
            {criticalCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-danger text-white text-[9px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(231,90,67,0.6)]">
                {criticalCount > 9 ? '9+' : criticalCount}
              </span>
            )}
          </button>
        </Tooltip>

        {/* Search */}
        <Tooltip content="Search (⌘K)" side="bottom">
          <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-border bg-transparent text-[#3d566e] hover:bg-surface hover:text-[#8FA3BF] transition-all cursor-pointer">
            <Search className="w-4 h-4" />
          </button>
        </Tooltip>

        {/* User */}
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          {/* Avatar */}
          <div className="relative">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-primary to-secondary opacity-60" />
            <div className="relative w-7 h-7 rounded-full bg-gradient-to-br from-surface-2 to-surface flex items-center justify-center text-primary text-xs font-bold font-mono">
              {user?.name?.charAt(0).toUpperCase() ?? 'A'}
            </div>
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-[12px] font-semibold text-[#E2E8F0] leading-tight">{user?.name ?? 'Analyst'}</span>
            <span className="text-[9px] text-[#3d566e] font-mono uppercase tracking-wider leading-tight">{user?.role ?? 'analyst'}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} className="text-[11px] text-[#3d566e] hover:text-danger ml-1 h-7 px-2">
            Exit
          </Button>
        </div>
      </div>
    </header>
  )
}
