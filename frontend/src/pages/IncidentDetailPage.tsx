import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ChevronLeft, Brain, GitBranch, FileText,
  AlertTriangle, Clock, Monitor, User, Shield,
} from 'lucide-react'
import { PageContainer } from '@/components/layout'
import {
  Card, CardHeader, CardTitle, CardContent,
  Button, Badge, SeverityBadge, StatusBadge, Skeleton,
} from '@/components/ui'
import { incidentsService } from '@/services/incidents.service'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import type { Incident } from '@/types'
import { SOARPlaybook } from '@/features/incidents/components/SOARPlaybook'

const MOCK_INCIDENT: Incident = {
  id: '1',
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
  const [activeTab, setActiveTab] = useState<'narrative' | 'prediction' | 'timeline' | 'assets' | 'soar'>('narrative')

  const { data: incident, isLoading } = useQuery({
    queryKey: ['incident', id],
    queryFn: () => incidentsService.get(id!),
    enabled: !!id,
  })

  const display = incident ?? MOCK_INCIDENT

  const { mutate: generateNarrative, isPending: generatingNarrative } = useMutation({
    mutationFn: () => incidentsService.generateNarrative(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incident', id] }),
  })

  if (isLoading) {
    return (
      <PageContainer>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      {/* Back link */}
      <Link to="/incidents" className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider transition-colors"
        style={{ color: '#3d566e' }}
        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#00D9B4' }}
        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#3d566e' }}
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        All Incidents
      </Link>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="text-[9px] font-mono uppercase tracking-[0.15em]" style={{ color: '#3d566e' }}>Incident Response</div>
            <h1 className="text-xl font-bold font-mono" style={{ color: '#E2E8F0' }}>{display.title}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <SeverityBadge severity={display.severity} dot />
              <StatusBadge status={display.status} />
              <Badge variant="default">
                <Clock className="w-3 h-3" />
                {formatRelativeTime(display.created_at)}
              </Badge>
              <Badge variant="default">{display.event_count} events</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="secondary" size="sm" asChild>
              <Link to={`/attack-graph/${display.id}`}>
                <GitBranch className="w-4 h-4" />
                Attack Graph
              </Link>
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <Link to={`/ai-investigation/${display.id}`}>
                <Brain className="w-4 h-4" />
                AI Investigate
              </Link>
            </Button>
            <Button variant="secondary" size="sm">
              <FileText className="w-4 h-4" />
              Export Report
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Main panel */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          {/* Tabs */}
          <div className="flex gap-1 border-b border-border">
            {(['narrative', 'prediction', 'assets', 'soar'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-semibold capitalize transition-colors border-b-2 -mb-px cursor-pointer ${
                  activeTab === tab
                    ? 'text-primary border-primary'
                    : 'text-[#3d566e] border-transparent hover:text-[#E2E8F0]'
                }`}
              >
                {tab === 'narrative' ? 'Threat Narrative' : tab === 'prediction' ? 'AI Prediction' : tab === 'soar' ? 'SOAR Actions' : 'Assets & Users'}
              </button>
            ))}
          </div>

          {activeTab === 'narrative' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              <Card>
                <CardContent className="pt-5">
                  {display.threat_narrative ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-[#E2E8F0]">AI-Generated Threat Narrative</h3>
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => generateNarrative()}
                          loading={generatingNarrative}
                        >
                          Regenerate
                        </Button>
                      </div>
                      <div className="prose-sm text-[#8FA3BF] leading-relaxed border-l-2 border-primary/30 pl-4 py-1">
                        {display.threat_narrative}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-[#3d566e]">
                      <Brain className="w-8 h-8 mb-3 opacity-30" />
                      <p className="text-sm mb-4">No narrative generated yet</p>
                      <Button onClick={() => generateNarrative()} loading={generatingNarrative}>
                        <Brain className="w-4 h-4" />
                        Generate AI Narrative
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'prediction' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              <div className="flex flex-col gap-3">
                {display.predicted_next_steps?.map((step, i) => (
                  <Card key={step.technique_id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="primary">{step.technique_id}</Badge>
                            <span className="text-sm font-semibold text-[#E2E8F0]">{step.technique_name}</span>
                          </div>
                          <p className="text-xs text-[#8FA3BF]">{step.reasoning}</p>
                          <div className="flex items-center gap-4 text-xs text-[#3d566e]">
                            <span><Clock className="w-3 h-3 inline mr-1" />{step.time_estimate}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {step.indicators_to_watch.map(ind => (
                              <Badge key={ind} variant="muted" className="text-[10px]">{ind}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-lg font-bold text-[#E2E8F0]">
                            {Math.round(step.probability * 100)}%
                          </span>
                          <span className="text-[10px] text-[#3d566e]">probability</span>
                          <div className="w-16 h-1.5 rounded-full bg-border overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-danger"
                              initial={{ width: 0 }}
                              animate={{ width: `${step.probability * 100}%` }}
                              transition={{ delay: i * 0.1 + 0.3, duration: 0.6 }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'assets' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle>Affected Assets</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      {display.affected_assets.map(a => (
                        <div key={a} className="flex items-center gap-2 text-sm text-[#8FA3BF]">
                          <Monitor className="w-4 h-4 text-[#3d566e]" />
                          {a}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Affected Users</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      {display.affected_users.map(u => (
                        <div key={u} className="flex items-center gap-2 text-sm text-[#8FA3BF]">
                          <User className="w-4 h-4 text-[#3d566e]" />
                          {u}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
          {activeTab === 'soar' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              <Card>
                <CardContent className="pt-5">
                  <SOARPlaybook
                    incidentId={display.id}
                    affectedAssets={display.affected_assets as string[]}
                    affectedUsers={display.affected_users as string[]}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Side panel */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <CardTitle>MITRE Techniques</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {(display.mitre_techniques || []).map(t => {
                  const rec = t as unknown as Record<string, unknown>
                  const id = (rec.technique_id as string) || (rec.id as string) || 'Txxx'
                  const name = (rec.technique_name as string) || (rec.name as string) || 'Unknown Technique'
                  const confidence = typeof t.confidence === 'number' ? t.confidence : 1.0
                  const tactic = t.tactic || 'General'

                  return (
                    <div key={id} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="primary" className="text-[10px]">{id}</Badge>
                          <span className="text-xs text-[#E2E8F0]">{name}</span>
                        </div>
                        <span className="text-[10px] text-[#3d566e]">{Math.round(confidence * 100)}%</span>
                      </div>
                      <div className="h-1 rounded-full bg-border overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${confidence * 100}%` }}
                          transition={{ duration: 0.6 }}
                        />
                      </div>
                      <span className="text-[10px] text-[#3d566e] capitalize">{tactic.replace(/_/g, ' ')}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Incident Details</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 text-xs">
                {[
                  { label: 'Created',  value: formatDate(display.created_at, 'full') },
                  { label: 'Updated',  value: formatDate(display.updated_at, 'full') },
                  { label: 'Events',   value: display.event_count.toString() },
                  { label: 'Assigned', value: display.assigned_to ?? 'Unassigned' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-2">
                    <span className="text-[#3d566e]">{label}</span>
                    <span className="text-[#8FA3BF] text-right">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <AlertTriangle className="w-4 h-4" />
                  Escalate Incident
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Shield className="w-4 h-4" />
                  Contain Threat
                </Button>
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  <FileText className="w-4 h-4" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
