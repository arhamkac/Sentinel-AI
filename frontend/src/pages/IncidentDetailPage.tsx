import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft, Brain, GitBranch, FileText,
  Monitor, User, Server, RefreshCw
} from 'lucide-react'
import { PageContainer } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { incidentsService } from '@/services/incidents.service'
import { eventsService } from '@/services/events.service'
import type { Incident } from '@/types'
import { getSeverityStyles } from '@/lib/severity'
import { askCopilot } from '@/lib/copilot'

const MOCK_INCIDENT: Incident = {
  id: 'INC-2024-089',
  title: 'Ransomware Deployment Attempt on DC-01',
  description: 'A sophisticated ransomware attack was initiated following a phishing campaign that successfully compromised an employee workstation. The attacker proceeded to perform credential dumping, lateral movement, and eventually reached the domain controller.',
  severity: 'critical',
  status: 'investigating',
  threat_narrative: 'At 14:23 UTC, threat actor gained initial access to WS-07 via a spear-phishing email containing a malicious macro-enabled document. The attacker established persistence using a scheduled task, then executed PowerShell to download and run Mimikatz for credential harvesting. Using stolen domain admin credentials, the attacker pivoted to DC-01 via RDP at 15:47 UTC. Shadow copies were deleted at 16:12 UTC — a strong indicator of imminent ransomware deployment. The pattern is consistent with the ALPHV/BlackCat ransomware group.',
  predicted_next_steps: [
    {
      technique_id: 'T1486',
      technique_name: 'Data Encrypted for Impact',
      probability: 0.91,
      reasoning: 'Shadow copies deleted, all ransomware preconditions met',
      time_estimate: '30-90 minutes',
      indicators_to_watch: ['vssadmin.exe execution', 'mass file rename events', 'ransom note creation'],
    },
    {
      technique_id: 'T1041',
      technique_name: 'Exfiltration Over C2',
      probability: 0.65,
      reasoning: 'Double extortion is common with this threat actor profile',
      time_estimate: '1-4 hours',
      indicators_to_watch: ['large outbound data transfer', 'HTTPS to unknown domains'],
    },
  ],
  affected_assets: ['DC-01', 'WS-07', 'FS-02'],
  affected_users: ['john.doe', 'admin', 'svc_backup'],
  mitre_techniques: [
    { technique_id: 'T1566', technique_name: 'Phishing',              tactic: 'initial_access',      confidence: 0.95 },
    { technique_id: 'T1059', technique_name: 'PowerShell Execution',  tactic: 'execution',           confidence: 0.90 },
    { technique_id: 'T1003', technique_name: 'Credential Dumping',    tactic: 'credential_access',   confidence: 0.92 },
    { technique_id: 'T1021', technique_name: 'Remote Services (RDP)', tactic: 'lateral_movement',    confidence: 0.88 },
    { technique_id: 'T1490', technique_name: 'Inhibit System Recovery', tactic: 'impact',            confidence: 0.97 },
  ],
  event_count: 247,
  organization_id: 'org-1',
  created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  updated_at: new Date().toISOString(),
}

export function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'overview' | 'assets' | 'mitre' | 'logs'>('overview')

  const { data: incident, isLoading } = useQuery({
    queryKey: ['incident', id],
    queryFn: () => incidentsService.get(id!),
    enabled: !!id,
  })

  const { data: eventsData, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['incident-events', id],
    queryFn: () => eventsService.list({ incident_id: id }),
    enabled: !!id && activeTab === 'logs',
  })

  const display = incident ?? MOCK_INCIDENT

  const { mutate: generateNarrative, isPending: generatingNarrative } = useMutation({
    mutationFn: () => incidentsService.generateNarrative(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incident', id] }),
  })

  if (isLoading) {
    return (
      <PageContainer>
        <div className="h-8 w-48 bg-[var(--bg-inset)] rounded animate-pulse mb-6" />
        <div className="h-64 w-full bg-[var(--bg-inset)] rounded animate-pulse" />
      </PageContainer>
    )
  }

  const sev = getSeverityStyles(display.severity)

  return (
    <PageContainer className="flex flex-col gap-6">
      
      {/* ── Breadcrumb & Actions ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link 
          to="/incidents" 
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Incidents
        </Link>

        <div className="flex items-center gap-2">
          <Link 
            to={`/attack-graph/${display.id}`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-sm font-medium text-[var(--text-secondary)] transition-colors"
          >
            <GitBranch className="w-4 h-4" />
            Attack Graph
          </Link>
          <Link 
            to={`/ai-investigation/${display.id}`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[var(--primary-ring)] bg-[var(--primary-bg)] hover:brightness-110 text-sm font-medium text-[var(--primary)] transition-colors"
          >
            <Brain className="w-4 h-4" />
            AI Investigate
          </Link>
        </div>
      </div>

      {/* ── Header Card ── */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 justify-between">
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <span 
                  className="text-xs uppercase font-bold px-2.5 py-0.5 rounded border"
                  style={{ color: sev.color, backgroundColor: sev.bg, borderColor: sev.ring }}
                >
                  {display.severity}
                </span>
                <span className="text-xs uppercase font-medium px-2.5 py-0.5 rounded border border-[var(--border)] bg-[var(--bg-inset)] text-[var(--text-muted)]">
                  {display.status.replace('_', ' ')}
                </span>
                 <span className="text-xs font-mono text-[var(--text-muted)] px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--bg-inset)]">
                  {display.id.includes('-') && display.id.length > 20 ? `#${display.id.split('-')[0].toUpperCase()}` : display.id}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                {display.title}
              </h1>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-4xl">
                {display.description}
              </p>
            </div>

            <div className="flex flex-col gap-3 shrink-0 min-w-[200px] p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-inset)]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)]">Created</span>
                <span className="text-xs font-mono text-[var(--text-primary)]">{new Date(display.created_at).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)]">Total Events</span>
                <span className="text-xs font-mono text-[var(--text-primary)]">{display.event_count}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)]">Organization</span>
                <span className="text-xs font-mono text-[var(--text-primary)]">{display.organization_id}</span>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-[var(--border)] mt-2">
        {(['overview', 'assets', 'mitre', 'logs'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'text-[var(--primary)] border-[var(--primary)]'
                : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-primary)]'
            }`}
          >
            {tab === 'overview' ? 'Investigation Overview' : tab === 'assets' ? 'Affected Assets' : tab === 'mitre' ? 'MITRE ATT&CK' : 'Event Logs'}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="mt-2">
        
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Col: Narrative */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[var(--text-muted)]" />
                    Threat Narrative
                  </CardTitle>
                  <button 
                    onClick={() => generateNarrative()}
                    disabled={generatingNarrative}
                    className="text-xs flex items-center gap-1.5 text-[var(--primary)] font-medium hover:underline disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${generatingNarrative ? 'animate-spin' : ''}`} />
                    Regenerate
                  </button>
                </CardHeader>
                <CardContent>
                  {display.threat_narrative ? (
                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed whitespace-pre-wrap bg-[var(--bg-inset)] p-4 rounded-lg border border-[var(--border)]">
                      {display.threat_narrative}
                    </p>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-[var(--text-muted)] bg-[var(--bg-inset)] rounded-lg border border-[var(--border)] border-dashed">
                      <p className="text-sm">No threat narrative generated yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Col: AI Predictions */}
            <div className="flex flex-col gap-6">
              <Card className="border-[var(--primary-ring)] shadow-[0_0_16px_var(--primary-bg)]">
                <CardHeader className="bg-[var(--primary-bg)]/50 pb-4">
                  <CardTitle className="flex items-center gap-2 text-[var(--primary)]">
                    <Brain className="w-4 h-4" />
                    AI Predicted Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 mt-4">
                  {display.predicted_next_steps?.map((step, idx) => (
                    <div key={idx} className="flex flex-col gap-2 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-inset)]">
                      <div className="flex items-start justify-between">
                        <span className="text-sm font-semibold text-[var(--text-primary)]">{step.technique_name}</span>
                        <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border)]">
                          {(step.probability * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)]">{step.reasoning}</p>
                      <div className="mt-2 text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">
                        Est. Time: <span className="text-[var(--primary)]">{step.time_estimate}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  Affected Devices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  {display.affected_assets.map(asset => (
                    <div key={asset} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-inset)]">
                      <Server className="w-4 h-4 text-[var(--text-muted)]" />
                      <span className="font-mono text-sm text-[var(--text-primary)]">{asset}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Compromised Identities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  {display.affected_users.map(user => (
                    <div key={user} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-inset)]">
                      <div className="w-6 h-6 rounded bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center text-xs font-bold text-[var(--text-secondary)]">
                        {user.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-mono text-sm text-[var(--text-primary)]">{user}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'mitre' && (
          <Card>
            <CardHeader>
              <CardTitle>Observed Tactics & Techniques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                      <th className="pb-3 font-medium">Technique ID</th>
                      <th className="pb-3 font-medium">Name</th>
                      <th className="pb-3 font-medium">Tactic</th>
                      <th className="pb-3 font-medium text-right">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {display.mitre_techniques.map((t, idx) => (
                      <tr key={idx} className="hover:bg-[var(--bg-inset)] transition-colors">
                        <td className="py-3 font-mono text-[var(--primary)]">{t.technique_id}</td>
                        <td className="py-3 text-[var(--text-primary)] font-medium">{t.technique_name}</td>
                        <td className="py-3 text-[var(--text-muted)] capitalize">{t.tactic.replace(/_/g, ' ')}</td>
                        <td className="py-3 text-right font-mono text-[var(--text-secondary)]">
                          {(t.confidence * 100).toFixed(0)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'logs' && (
          <Card>
            <CardHeader className="border-b border-[var(--border)]" style={{ padding: '24px' }}>
              <div className="flex flex-col gap-1">
                <CardTitle>Correlated Security Events</CardTitle>
                <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed" style={{ maxWidth: '800px' }}>
                  💡 **What is this?** These are the raw digital footprints (log events) that triggered this incident. 
                  Think of them like security camera footage—each line represents a specific activity detected on your network.
                  If any log looks too technical, click the **Ask AI** button next to it for a simple, plain-English explanation!
                </p>
              </div>
            </CardHeader>
            <CardContent style={{ padding: '24px' }}>
              {isLoadingEvents ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-pulse text-sm text-[var(--text-muted)]">Loading events...</div>
                </div>
              ) : !eventsData || eventsData.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-[var(--text-muted)] bg-[var(--bg-inset)] rounded-lg border border-[var(--border)] border-dashed">
                  <p className="text-sm">No correlated event logs found for this incident.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                        <th className="pb-3 font-medium">Timestamp</th>
                        <th className="pb-3 font-medium">Type</th>
                        <th className="pb-3 font-medium">Severity</th>
                        <th className="pb-3 font-medium">Host</th>
                        <th className="pb-3 font-medium">User/Process</th>
                        <th className="pb-3 font-medium">Description</th>
                        <th className="pb-3 font-medium">AI Help</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {eventsData.items.map(event => {
                        const sevColors: Record<string, string> = {
                          critical: 'text-[var(--danger)] bg-[var(--danger-bg)] border-[var(--danger-ring)]',
                          high: 'text-[var(--warning)] bg-[var(--warning-bg)] border-[var(--warning-ring)]',
                          medium: 'text-[var(--primary)] bg-[var(--primary-bg)] border-[var(--primary-ring)]',
                          low: 'text-[var(--text-muted)] bg-[var(--bg-inset)] border-[var(--border)]',
                        }
                        const sevClass = sevColors[event.severity] || sevColors.low

                        return (
                          <tr key={event.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                            <td className="py-3.5 font-mono text-xs text-[var(--text-secondary)]">
                              {new Date(event.timestamp).toLocaleString()}
                            </td>
                            <td className="py-3.5 capitalize text-[var(--text-primary)]">
                              {event.event_type}
                            </td>
                            <td className="py-3.5">
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${sevClass}`}>
                                {event.severity}
                              </span>
                            </td>
                            <td className="py-3.5 font-mono text-xs text-[var(--text-primary)]">
                              {event.hostname}
                            </td>
                            <td className="py-3.5 text-[var(--text-secondary)]">
                              {event.user || event.process ? (
                                <div className="flex flex-col gap-0.5">
                                  {event.user && <span className="font-mono text-xs text-[var(--text-primary)]">{event.user}</span>}
                                  {event.process && <span className="text-[10px] text-[var(--text-muted)] font-mono">{event.process}</span>}
                                </div>
                              ) : (
                                <span className="text-[var(--text-muted)]">-</span>
                              )}
                            </td>
                            <td className="py-3.5 text-[var(--text-secondary)] leading-relaxed max-w-md truncate" title={event.description}>
                              {event.description}
                              {event.mitre_technique_id && (
                                <span className="ml-2 px-1.5 py-0.5 text-[10px] font-mono rounded bg-[var(--primary-bg)] text-[var(--primary)] border border-[var(--primary-ring)]">
                                  {event.mitre_technique_id}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5">
                              <button
                                onClick={() => askCopilot(`Explain this security event log in simple terms for a non-technical person:\nEvent: ${event.description}\nHost: ${event.hostname}\nUser/Process: ${event.user || 'None'} / ${event.process || 'None'}`)}
                                className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded bg-[var(--primary-bg)] text-[var(--primary)] border border-[var(--primary-ring)] hover:brightness-110 transition-all cursor-pointer whitespace-nowrap"
                              >
                                <Brain className="w-3.5 h-3.5" />
                                Ask AI
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

      </div>
    </PageContainer>
  )
}
