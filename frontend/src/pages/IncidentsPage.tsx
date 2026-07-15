import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, RefreshCw, AlertTriangle, ShieldAlert, Target } from 'lucide-react'
import { PageContainer } from '@/components/layout'
import { Card, CardContent } from '@/components/ui/Card'
import { useQuery } from '@tanstack/react-query'
import { incidentsService } from '@/services/incidents.service'
import type { Incident } from '@/types'
import { PageHeader, EmptyState } from '@/components/common'
import { getSeverityStyles, getStatusStyles } from '@/lib/severity'

const MOCK_INCIDENTS: Incident[] = [
  { id:'INC-2024-089', title:'Ransomware Deployment Attempt on DC-01', description:'Attacker used phishing to gain initial access before attempting ransomware deployment.', severity:'critical', status:'investigating', affected_assets:['DC-01','FS-02'], affected_users:['john.doe'], mitre_techniques:[{technique_id:'T1566',technique_name:'Phishing',tactic:'initial_access',confidence:0.95}], event_count:247, organization_id:'org-1', created_at: new Date(Date.now()-3600000).toISOString(), updated_at: new Date().toISOString() },
  { id:'INC-2024-088', title:'Lateral Movement via RDP', description:'Unusual RDP connections across multiple workstations', severity:'high', status:'open', affected_assets:['WS-15','WS-22'], affected_users:['jane.smith'], mitre_techniques:[{technique_id:'T1021',technique_name:'Remote Services',tactic:'lateral_movement',confidence:0.88}], event_count:89, organization_id:'org-1', created_at: new Date(Date.now()-7200000).toISOString(), updated_at: new Date().toISOString() },
  { id:'INC-2024-087', title:'Credential Dumping via LSASS', description:'Mimikatz-like tool detected accessing LSASS memory', severity:'high', status:'contained', affected_assets:['WS-07'], affected_users:['bob.wilson'], mitre_techniques:[{technique_id:'T1003',technique_name:'OS Credential Dumping',tactic:'credential_access',confidence:0.92}], event_count:45, organization_id:'org-1', created_at: new Date(Date.now()-14400000).toISOString(), updated_at: new Date().toISOString() },
  { id:'INC-2024-086', title:'Anomalous DNS Tunneling Detected', description:'Suspected data exfiltration via DNS tunneling to external domain', severity:'medium', status:'open', affected_assets:['WS-12'], affected_users:['alice.cooper'], mitre_techniques:[{technique_id:'T1071',technique_name:'Application Layer Protocol',tactic:'command_and_control',confidence:0.75}], event_count:32, organization_id:'org-1', created_at: new Date(Date.now()-28800000).toISOString(), updated_at: new Date().toISOString() },
  { id:'INC-2024-085', title:'Scheduled Task Persistence', description:'Malicious scheduled task created for persistence', severity:'medium', status:'resolved', affected_assets:['WS-03'], affected_users:['charlie.davis'], mitre_techniques:[{technique_id:'T1053',technique_name:'Scheduled Task/Job',tactic:'persistence',confidence:0.85}], event_count:18, organization_id:'org-1', created_at: new Date(Date.now()-86400000).toISOString(), updated_at: new Date().toISOString() },
]

export function IncidentsPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')

  // Debounce search input to avoid API spam
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['incidents', { search: debouncedSearch, severity: severityFilter }],
    queryFn: () => incidentsService.list({ search: debouncedSearch, severity: severityFilter, page: 1, page_size: 20 }),
  })

  // Use API data if available; fall back to mock data with client-side filtering
  const isUsingMockData = !data?.items
  const rawIncidents = data?.items ?? MOCK_INCIDENTS
  const filtered = isUsingMockData
    ? rawIncidents.filter(i =>
        (!search || i.title.toLowerCase().includes(search.toLowerCase())) &&
        (!severityFilter || i.severity === severityFilter)
      )
    : rawIncidents

  const stats = [
    { label: 'Total Incidents', value: filtered.length, icon: Target, colorClass: 'text-[var(--text-primary)]', bgClass: 'bg-[var(--bg-inset)]' },
    { label: 'Critical', value: filtered.filter(i => i.severity === 'critical').length, icon: ShieldAlert, colorClass: 'text-[var(--danger)]', bgClass: 'bg-[var(--danger-bg)]' },
    { label: 'High', value: filtered.filter(i => i.severity === 'high').length, icon: AlertTriangle, colorClass: 'text-[var(--warning)]', bgClass: 'bg-[var(--warning-bg)]' },
    { label: 'Under Review', value: filtered.filter(i => i.status === 'investigating').length, icon: Search, colorClass: 'text-[var(--primary)]', bgClass: 'bg-[var(--primary-bg)]' },
  ]

  return (
    <PageContainer className="flex flex-col gap-6">
      
      {/* ── Header ── */}
      <PageHeader
        title="Incident Management"
        description="Active security incidents requiring investigation and response."
        actions={
          <button 
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-sm font-medium text-[var(--text-secondary)] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        }
      />

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">{s.label}</p>
                <p className={`text-2xl font-bold font-mono ${s.colorClass}`}>{s.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.bgClass}`}>
                <s.icon className={`w-5 h-5 ${s.colorClass}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Filters & List ── */}
      <Card>
        <div className="flex flex-wrap items-center gap-4 border-b border-[var(--border)] bg-[var(--bg-surface)] rounded-t-[var(--radius-lg)]" style={{ padding: '16px' }}>
          <div className="flex items-center gap-2 flex-1 min-w-[240px] px-3 py-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-inset)] focus-within:border-[var(--primary-dim)] transition-colors">
            <Search className="w-4 h-4 text-[var(--text-muted)]" />
            <input
              className="bg-transparent flex-1 text-sm text-[var(--text-primary)] outline-none placeholder-[var(--text-muted)]"
              placeholder="Search incidents..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-inset)]">
            <Filter className="w-4 h-4 text-[var(--text-muted)]" />
            <select
              className="bg-transparent text-sm text-[var(--text-primary)] outline-none cursor-pointer"
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              aria-label="Filter by severity"
            >
              <option value="">All Severities</option>
              {['critical','high','medium','low'].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-[var(--bg-inset)] animate-pulse m-4 rounded-md" />
            ))
          ) : filtered.length === 0 ? (
            <div style={{ padding: '16px' }}>
              <EmptyState
                title="No incidents found"
                description="No incidents matched your query. Try broadening your filters."
              />
            </div>
          ) : (
            filtered.map((incident) => {
              const sev = getSeverityStyles(incident.severity);
              const stat = getStatusStyles(incident.status);

              return (
                <Link 
                  key={incident.id} 
                  to={`/incidents/${incident.id}`}
                  className="block bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] transition-colors group relative border-b border-[var(--border)] last:border-0"
                  style={{ padding: '16px' }}
                >
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity" 
                    style={{ backgroundColor: sev.color }} 
                  />
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span 
                          className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border"
                          style={{ color: sev.color, backgroundColor: sev.bg, borderColor: sev.ring }}
                        >
                          {incident.severity}
                        </span>
                        <span 
                          className="text-[10px] uppercase font-medium px-2 py-0.5 rounded border border-[var(--border)]"
                          style={{ color: stat.color, backgroundColor: stat.bg }}
                        >
                          {incident.status.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-inset)] px-1.5 py-0.5 rounded border border-[var(--border)]">
                          {incident.id.includes('-') && incident.id.length > 20 ? `#${incident.id.split('-')[0].toUpperCase()}` : incident.id}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate mb-1">
                        {incident.title}
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] line-clamp-1">
                        {incident.description}
                      </p>
                    </div>

                    <div className="flex flex-col md:items-end gap-1 shrink-0">
                      <div className="text-xs text-[var(--text-secondary)] font-mono">
                        {new Date(incident.created_at).toLocaleTimeString()} · {new Date(incident.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-1">
                        <span className="font-medium">Assets:</span> {incident.affected_assets?.map(a => typeof a === 'string' ? a : (a as any).hostname || (a as any).name || (a as any).id || 'Unknown').join(', ') || 'None'}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)]">
                        <span className="font-medium">Events:</span> {incident.event_count}
                      </div>
                    </div>

                  </div>
                </Link>
              )
            })
          )}
        </div>
      </Card>
    </PageContainer>
  )
}
