import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertTriangle, ArrowRight, Search, Filter, RefreshCw } from 'lucide-react'
import { PageContainer } from '@/components/layout'
import { useQuery } from '@tanstack/react-query'
import { incidentsService } from '@/services/incidents.service'
import type { Incident } from '@/types'

const PRIMARY = '#00D9B4'
const WARN    = '#FFB040'
const DANGER  = '#E75A43'
const DIM     = '#3d566e'
const MUTED   = '#8FA3BF'
const BRIGHT  = '#E2E8F0'
const SURFACE = '#071022'
const BORDER  = '#162030'

const MOCK_INCIDENTS: Incident[] = [
  { id:'1', title:'Ransomware Deployment Attempt on DC-01', description:'Attacker used phishing to gain initial access before attempting ransomware deployment.', severity:'critical', status:'investigating', affected_assets:['DC-01','FS-02'], affected_users:['john.doe'], mitre_techniques:[{technique_id:'T1566',technique_name:'Phishing',tactic:'initial_access',confidence:0.95}], event_count:247, organization_id:'org-1', created_at: new Date(Date.now()-3600000).toISOString(), updated_at: new Date().toISOString() },
  { id:'2', title:'Lateral Movement via RDP', description:'Unusual RDP connections across multiple workstations', severity:'high', status:'open', affected_assets:['WS-15','WS-22'], affected_users:['jane.smith'], mitre_techniques:[{technique_id:'T1021',technique_name:'Remote Services',tactic:'lateral_movement',confidence:0.88}], event_count:89, organization_id:'org-1', created_at: new Date(Date.now()-7200000).toISOString(), updated_at: new Date().toISOString() },
  { id:'3', title:'Credential Dumping via LSASS', description:'Mimikatz-like tool detected accessing LSASS memory', severity:'high', status:'contained', affected_assets:['WS-07'], affected_users:['bob.wilson'], mitre_techniques:[{technique_id:'T1003',technique_name:'OS Credential Dumping',tactic:'credential_access',confidence:0.92}], event_count:45, organization_id:'org-1', created_at: new Date(Date.now()-14400000).toISOString(), updated_at: new Date().toISOString() },
  { id:'4', title:'Anomalous DNS Tunneling Detected', description:'Suspected data exfiltration via DNS tunneling to external domain', severity:'medium', status:'open', affected_assets:['WS-12'], affected_users:['alice.cooper'], mitre_techniques:[{technique_id:'T1071',technique_name:'Application Layer Protocol',tactic:'command_and_control',confidence:0.75}], event_count:32, organization_id:'org-1', created_at: new Date(Date.now()-28800000).toISOString(), updated_at: new Date().toISOString() },
  { id:'5', title:'Scheduled Task Persistence', description:'Malicious scheduled task created for persistence', severity:'medium', status:'resolved', affected_assets:['WS-03'], affected_users:['charlie.davis'], mitre_techniques:[{technique_id:'T1053',technique_name:'Scheduled Task/Job',tactic:'persistence',confidence:0.85}], event_count:18, organization_id:'org-1', created_at: new Date(Date.now()-86400000).toISOString(), updated_at: new Date().toISOString() },
]

function severityColor(s: string) {
  if (s === 'critical') return DANGER
  if (s === 'high')     return WARN
  if (s === 'medium')   return '#7C3AED'
  return DIM
}

function statusColor(s: string) {
  if (s === 'resolved' || s === 'closed') return PRIMARY
  if (s === 'contained')                  return WARN
  if (s === 'investigating')              return WARN
  return MUTED
}

export function IncidentsPage() {
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['incidents', { search, severity: severityFilter }],
    queryFn: () => incidentsService.list({ search, severity: severityFilter, page: 1, page_size: 20 }),
  })

  const incidents = data?.items ?? MOCK_INCIDENTS
  const filtered  = incidents.filter(i =>
    (!search || i.title.toLowerCase().includes(search.toLowerCase())) &&
    (!severityFilter || i.severity === severityFilter)
  )

  const stats = [
    { label: 'Total Incidents',  value: filtered.length.toString(),                                              color: BRIGHT },
    { label: 'Critical',         value: filtered.filter(i => i.severity === 'critical').length.toString(),       color: DANGER },
    { label: 'High',             value: filtered.filter(i => i.severity === 'high').length.toString(),           color: WARN   },
    { label: 'Under Review',     value: filtered.filter(i => i.status === 'investigating').length.toString(),    color: PRIMARY },
  ]

  return (
    <PageContainer>
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[9px] font-mono uppercase tracking-[0.15em] mb-1" style={{ color: DIM }}>Security Operations Center</div>
          <h1 className="text-xl font-bold font-mono" style={{ color: BRIGHT }}>Incident Management</h1>
          <p className="text-[11px] font-mono mt-0.5" style={{ color: MUTED }}>Active security incidents requiring investigation and response</p>
        </div>
        <button onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border text-[11px] font-mono font-bold uppercase tracking-widest transition-all hover:brightness-110"
          style={{ borderColor: PRIMARY + '40', background: PRIMARY + '10', color: PRIMARY }}>
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="px-5 py-4 rounded-2xl border" style={{ background: SURFACE, borderColor: BORDER }}>
            <div className="text-[9px] font-mono uppercase tracking-widest mb-1" style={{ color: DIM }}>{s.label}</div>
            <div className="text-2xl font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-3 rounded-2xl border" style={{ background: SURFACE, borderColor: BORDER }}>
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search style={{ width: 13, height: 13, color: DIM }} />
          <input
            className="bg-transparent flex-1 text-[11px] font-mono outline-none"
            style={{ color: BRIGHT }}
            placeholder="Search incidents..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter style={{ width: 12, height: 12, color: DIM }} />
          <select
            className="bg-transparent text-[11px] font-mono outline-none cursor-pointer"
            style={{ color: MUTED }}
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
          >
            <option value="" style={{ background: SURFACE }}>All Severities</option>
            {['critical','high','medium','low'].map(s => (
              <option key={s} value={s} style={{ background: SURFACE }}>{s.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Incident list */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: SURFACE }} />
          ))
        ) : filtered.map((incident, idx) => (
          <motion.div
            key={incident.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
          >
            <Link to={`/incidents/${incident.id}`}>
              <div className="flex items-start gap-4 px-5 py-4 rounded-2xl border transition-all hover:brightness-110 group"
                style={{ background: SURFACE, borderColor: BORDER, borderLeftWidth: 2, borderLeftColor: severityColor(incident.severity) }}>

                {/* Severity icon */}
                <div className="p-2 rounded-xl mt-0.5 shrink-0"
                  style={{ background: severityColor(incident.severity) + '15' }}>
                  <AlertTriangle style={{ width: 14, height: 14, color: severityColor(incident.severity) }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-bold"
                          style={{ color: severityColor(incident.severity), borderColor: severityColor(incident.severity) + '40', background: severityColor(incident.severity) + '10' }}>
                          {incident.severity}
                        </span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded border uppercase"
                          style={{ color: statusColor(incident.status), borderColor: BORDER }}>
                          {incident.status}
                        </span>
                        <span className="text-[9px] font-mono" style={{ color: DIM }}>
                          {incident.mitre_techniques?.[0]?.technique_id}
                        </span>
                      </div>
                      <h3 className="text-[13px] font-bold font-mono" style={{ color: BRIGHT }}>{incident.title}</h3>
                      <p className="text-[11px] mt-1 line-clamp-1" style={{ color: MUTED }}>{incident.description}</p>
                    </div>
                    <ArrowRight style={{ width: 15, height: 15, color: DIM, marginTop: 2, flexShrink: 0 }}
                      className="group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-[9px] font-mono" style={{ color: DIM }}>
                    <span>ASSETS: <span style={{ color: MUTED }}>{incident.affected_assets?.slice(0,3).join(', ')}</span></span>
                    <span>EVENTS: <span style={{ color: PRIMARY }}>{incident.event_count}</span></span>
                    <span className="ml-auto">{new Date(incident.created_at).toLocaleTimeString('en-GB')}</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </PageContainer>
  )
}
