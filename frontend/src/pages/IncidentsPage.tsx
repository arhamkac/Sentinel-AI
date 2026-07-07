import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search, Filter, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react'
import { PageContainer } from '@/components/layout'
import { Card, CardContent, Input, Button, Badge, SeverityBadge, StatusBadge, SkeletonCard } from '@/components/ui'
import { incidentsService } from '@/services/incidents.service'
import { formatRelativeTime } from '@/lib/utils'
import type { Incident } from '@/types'

const MOCK_INCIDENTS: Incident[] = [
  { id:'1', title:'Ransomware Deployment Attempt on DC-01', description:'Attacker used phishing to gain initial access before attempting ransomware deployment.', severity:'critical', status:'investigating', affected_assets:['DC-01','FS-02'], affected_users:['john.doe'], mitre_techniques:[{technique_id:'T1566',technique_name:'Phishing',tactic:'initial_access',confidence:0.95}], event_count:247, organization_id:'org-1', created_at: new Date(Date.now()-3600000).toISOString(), updated_at: new Date().toISOString() },
  { id:'2', title:'Lateral Movement via RDP', description:'Unusual RDP connections across multiple workstations', severity:'high', status:'open', affected_assets:['WS-15','WS-22'], affected_users:['jane.smith'], mitre_techniques:[{technique_id:'T1021',technique_name:'Remote Services',tactic:'lateral_movement',confidence:0.88}], event_count:89, organization_id:'org-1', created_at: new Date(Date.now()-7200000).toISOString(), updated_at: new Date().toISOString() },
  { id:'3', title:'Credential Dumping via LSASS', description:'Mimikatz-like tool detected accessing LSASS memory', severity:'high', status:'contained', affected_assets:['WS-07'], affected_users:['bob.wilson'], mitre_techniques:[{technique_id:'T1003',technique_name:'OS Credential Dumping',tactic:'credential_access',confidence:0.92}], event_count:45, organization_id:'org-1', created_at: new Date(Date.now()-14400000).toISOString(), updated_at: new Date().toISOString() },
  { id:'4', title:'Anomalous DNS Tunneling Detected', description:'Suspected data exfiltration via DNS tunneling to external domain', severity:'medium', status:'open', affected_assets:['WS-12'], affected_users:['alice.cooper'], mitre_techniques:[{technique_id:'T1071',technique_name:'Application Layer Protocol',tactic:'command_and_control',confidence:0.75}], event_count:32, organization_id:'org-1', created_at: new Date(Date.now()-28800000).toISOString(), updated_at: new Date().toISOString() },
  { id:'5', title:'Scheduled Task Persistence', description:'Malicious scheduled task created for persistence', severity:'medium', status:'resolved', affected_assets:['WS-03'], affected_users:['charlie.davis'], mitre_techniques:[{technique_id:'T1053',technique_name:'Scheduled Task/Job',tactic:'persistence',confidence:0.85}], event_count:18, organization_id:'org-1', created_at: new Date(Date.now()-86400000).toISOString(), updated_at: new Date().toISOString() },
]

const SEVERITY_OPTIONS = ['', 'critical', 'high', 'medium', 'low', 'info']
const STATUS_OPTIONS = ['', 'open', 'investigating', 'contained', 'resolved', 'closed']

export function IncidentsPage() {
  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['incidents', { search, severity, status, page }],
    queryFn: () => incidentsService.list({ search, severity, status, page, page_size: 20 }),
  })

  const incidents = data?.items ?? MOCK_INCIDENTS

  return (
    <PageContainer
      title="Incidents"
      description="All security incidents requiring investigation"
      action={
        <Button variant="ghost" size="icon" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      }
    >
      {/* Filters */}
      <Card>
        <CardContent className="py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search incidents…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#3d566e]" />
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value)}
                className="h-9 rounded-lg bg-surface border border-border text-[#E2E8F0] text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
              >
                <option value="">All Severities</option>
                {SEVERITY_OPTIONS.filter(Boolean).map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="h-9 rounded-lg bg-surface border border-border text-[#E2E8F0] text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
              >
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.filter(Boolean).map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incident list */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : incidents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#3d566e]">
          <AlertTriangle className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm">No incidents match your filters</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {incidents.map((incident, i) => (
            <IncidentRow key={incident.id} incident={incident} index={i} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            Previous
          </Button>
          <span className="text-xs text-[#3d566e]">Page {page} of {data.pages}</span>
          <Button variant="outline" size="sm" disabled={page === data.pages} onClick={() => setPage(p => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </PageContainer>
  )
}

function IncidentRow({ incident, index }: { incident: Incident; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Link to={`/incidents/${incident.id}`}>
        <Card hover className="group">
          <CardContent className="py-4">
            <div className="flex items-start gap-4">
              {/* Severity indicator */}
              <div className="w-1 self-stretch rounded-full shrink-0"
                style={{
                  background: incident.severity === 'critical' ? '#FF4D6D'
                    : incident.severity === 'high' ? '#F97316'
                    : incident.severity === 'medium' ? '#F59E0B'
                    : '#10D9A0'
                }}
              />

              {/* Main content */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-sm font-semibold text-[#E2E8F0] group-hover:text-[#00E5FF] transition-colors leading-snug">
                    {incident.title}
                  </h3>
                  <ArrowRight className="w-4 h-4 text-[#3d566e] group-hover:text-[#00E5FF] shrink-0 transition-colors mt-0.5" />
                </div>
                <p className="text-xs text-[#3d566e] line-clamp-1">{incident.description}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <SeverityBadge severity={incident.severity} dot />
                  <StatusBadge status={incident.status} />
                  <Badge variant="default" className="text-[10px]">
                    {incident.event_count} events
                  </Badge>
                  {incident.mitre_techniques.slice(0, 2).map(t => (
                    <Badge key={t.technique_id} variant="primary" className="text-[10px]">
                      {t.technique_id}
                    </Badge>
                  ))}
                  <span className="text-[11px] text-[#3d566e] ml-auto font-mono">
                    {formatRelativeTime(incident.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
