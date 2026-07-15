import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { incidentsService } from '@/services/incidents.service'
import { eventsService } from '@/services/events.service'
import {
  Shield, Activity, Target, ShieldAlert,
  TrendingUp, TrendingDown, ArrowRight,
  ActivitySquare
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { PageContainer } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { useEventsStore } from '@/stores/events.store'
import { PageHeader } from '@/components/common'

// ─── Mock Data ──────────────────────────────────────────────────
const chartData = [
  { time: '00:00', events: 120, threats: 12 },
  { time: '04:00', events: 340, threats: 45 },
  { time: '08:00', events: 890, threats: 120 },
  { time: '12:00', events: 1450, threats: 280 },
  { time: '16:00', events: 1100, threats: 190 },
  { time: '20:00', events: 780, threats: 85 },
  { time: '24:00', events: 230, threats: 24 },
]


export function DashboardPage() {
  const navigate = useNavigate()
  const { liveEvents } = useEventsStore()
  
  const { data: incidentsData } = useQuery({
    queryKey: ['incidents', { page: 1, page_size: 5 }],
    queryFn: () => incidentsService.list({ page: 1, page_size: 5 }),
  })

  const { data: dashboardStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => eventsService.getDashboardStats(),
  })
  
  const recentIncidents = incidentsData?.items ?? []

  // Use API stats with fallback to reasonable defaults
  const securityScore = dashboardStats?.security_score ?? 94
  const activeIncidentCount = dashboardStats?.active_incidents ?? recentIncidents.length
  const activeIncidentsChange = dashboardStats?.active_incidents_change ?? 0
  const mttd = dashboardStats?.mean_time_to_detect ?? 12
  const mttdChange = dashboardStats?.mtd_change ?? -2
  
  const criticalCount = liveEvents.filter(e => e.severity === 'critical').length
  const hasCritical = criticalCount > 0

  return (
    <PageContainer className="flex flex-col gap-6">
      
      {/* ── Page Header ── */}
      <PageHeader
        title="Security Overview"
        description="Real-time threat monitoring and organizational security posture."
      />

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <Card className="flex flex-col justify-between">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Security Score</span>
              <div className="w-8 h-8 rounded bg-[var(--primary-bg)] border border-[var(--primary-ring)] flex items-center justify-center">
                <Shield className="w-4 h-4 text-[var(--primary)]" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-[var(--text-primary)]">{securityScore}</span>
              <span className="text-sm font-mono text-[var(--text-muted)]">/ 100</span>
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs text-[var(--success)] font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>+2 points from last week</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2 */}
        <Card className="flex flex-col justify-between">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Active Incidents</span>
              <div className="w-8 h-8 rounded bg-[var(--warning-bg)] border border-[var(--warning-ring)] flex items-center justify-center">
                <Target className="w-4 h-4 text-[var(--warning)]" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-[var(--text-primary)]">{activeIncidentCount}</span>
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs text-[var(--warning)] font-medium">
              <span>{activeIncidentsChange >= 0 ? '+' : ''}{activeIncidentsChange} active since yesterday</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3 */}
        <Card className={`flex flex-col justify-between ${hasCritical ? 'border-[var(--danger)]/50 shadow-[0_0_16px_var(--danger-ring)]' : ''}`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Threat Level</span>
              <div className={`w-8 h-8 rounded flex items-center justify-center ${hasCritical ? 'bg-[var(--danger-bg)] border border-[var(--danger-ring)]' : 'bg-[var(--primary-bg)] border border-[var(--primary-ring)]'}`}>
                <ShieldAlert className={`w-4 h-4 ${hasCritical ? 'text-[var(--danger)]' : 'text-[var(--primary)]'}`} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono ${hasCritical ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]'}`}>
                {hasCritical ? 'CRITICAL' : 'ELEVATED'}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs text-[var(--text-muted)] font-medium">
              <span>{criticalCount} critical alerts active</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4 */}
        <Card className="flex flex-col justify-between">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Mean Time To Detect</span>
              <div className="w-8 h-8 rounded bg-[var(--info-bg)] border border-[var(--info)]/20 flex items-center justify-center">
                <Activity className="w-4 h-4 text-[var(--info)]" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-[var(--text-primary)]">{mttd}</span>
              <span className="text-sm font-mono text-[var(--text-muted)]">mins</span>
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs text-[var(--success)] font-medium">
              <span>{mttdChange}m vs. industry average</span>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* ── Main Dashboard Area ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (70%) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Main Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Event Volume & Threat Detection</CardTitle>
                <p className="text-xs text-[var(--text-muted)] mt-1">24-hour network activity</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--danger)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)', borderRadius: 8, fontSize: 12 }}
                      itemStyle={{ color: 'var(--text-primary)' }}
                    />
                    <Area type="monotone" dataKey="events" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorEvents)" />
                    <Area type="monotone" dataKey="threats" stroke="var(--danger)" strokeWidth={2} fillOpacity={1} fill="url(#colorThreats)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Incidents */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Active Incidents</CardTitle>
              <button
                onClick={() => navigate('/incidents')}
                className="text-xs text-[var(--primary)] font-medium hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none outline-none"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col gap-2">
                {recentIncidents.map(inc => (
                  <div key={inc.id} className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-inset)] hover:border-[var(--border-strong)] transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${inc.severity === 'critical' ? 'bg-[var(--danger)] shadow-[0_0_8px_var(--danger-ring)]' : inc.severity === 'high' ? 'bg-[var(--warning)]' : 'bg-[var(--primary)]'}`} />
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{inc.title}</p>
                        <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">{inc.id}</p>
                      </div>
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">
                      {new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (30%) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Live Threat Feed */}
          <Card className="flex-1 min-h-[400px] flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Live Threat Feed</CardTitle>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--danger)] animate-pulse" />
                  <span className="text-xs text-[var(--text-muted)] font-medium">LIVE</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0 relative">
              <div className="absolute inset-0 overflow-y-auto px-6 pb-6 pt-2 flex flex-col gap-3">
                {liveEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] text-sm">
                    <ActivitySquare className="w-8 h-8 mb-2 opacity-50" />
                    Waiting for events...
                  </div>
                ) : (
                  liveEvents.slice(0, 15).map(evt => (
                    <div key={evt.id} className="flex flex-col p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-inset)] animate-[slide-up_0.2s_ease-out]">
                      <div className="flex items-start justify-between mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider font-mono ${evt.severity === 'critical' ? 'text-[var(--danger)]' : evt.severity === 'high' ? 'text-[var(--warning)]' : 'text-[var(--primary)]'}`}>
                          {evt.event_type.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] font-mono">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-[var(--text-primary)] mb-2 line-clamp-2">{evt.description}</p>
                      {evt.mitre_technique_id && (
                        <div className="self-start mt-auto">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--primary-bg)] text-[var(--primary)] border border-[var(--primary-ring)] font-mono">
                            {evt.mitre_technique_id}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          
        </div>
      </div>
    </PageContainer>
  )
}
