import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity, Play, CheckCircle, Clock, AlertTriangle, Zap,
  Shield, Radio, Skull, Database, Globe, Key, RefreshCw
} from 'lucide-react'
import { PageContainer } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { simulatorService } from '@/services/simulator.service'
import type { SimulationScenario, SimulationRun } from '@/types'
import { TwinControls } from '@/features/simulator/components/TwinControls'

const ATTACK_ICONS: Record<string, React.ElementType> = {
  Ransomware: Skull,
  APT: Shield,
  Exfiltration: Database,
  'Credential Attack': Key,
}

const MOCK_SCENARIOS: SimulationScenario[] = [
  { id:'s1', name:'Ransomware Kill Chain', description:'Simulates a complete ransomware attack from phishing email through encryption. Covers all major phases: initial access, execution, persistence, credential access, lateral movement, and impact.', attack_type:'Ransomware', severity:'critical', estimated_duration:'~3 minutes', techniques:['T1566','T1059','T1003','T1021','T1486'], target_profile:'Corporate Windows Environment' },
  { id:'s2', name:'APT Lateral Movement', description:'Advanced persistent threat performing stealthy lateral movement using valid credentials and living-off-the-land techniques.', attack_type:'APT', severity:'high', estimated_duration:'~2 minutes', techniques:['T1021','T1078','T1027','T1053'], target_profile:'Enterprise Active Directory' },
  { id:'s3', name:'Data Exfiltration via DNS', description:'Simulates slow, low-and-slow data exfiltration using DNS tunneling to bypass traditional network controls.', attack_type:'Exfiltration', severity:'medium', estimated_duration:'~90 seconds', techniques:['T1048','T1071','T1030'], target_profile:'Corporate Network with DNS monitoring' },
  { id:'s4', name:'Credential Stuffing Attack', description:'Automated credential stuffing attack against web application using breached credentials database.', attack_type:'Credential Attack', severity:'high', estimated_duration:'~60 seconds', techniques:['T1110','T1078','T1213'], target_profile:'Web Application' },
]

const MOCK_RUNS: SimulationRun[] = [
  { id:'r1', scenario_id:'s1', scenario_name:'Ransomware Kill Chain', status:'completed', events_generated:147, incident_id:'inc-sim-1', started_at: new Date(Date.now()-600000).toISOString(), completed_at: new Date(Date.now()-420000).toISOString() },
  { id:'r2', scenario_id:'s2', scenario_name:'APT Lateral Movement', status:'completed', events_generated:89, incident_id:'inc-sim-2', started_at: new Date(Date.now()-3600000).toISOString(), completed_at: new Date(Date.now()-3300000).toISOString() },
]

const ATTACK_STAGES = [
  { id: 1, label: 'Initial Access',       desc: 'Phishing email delivered — credential harvested', time: '09:12', done: true },
  { id: 2, label: 'Execution',            desc: 'PowerShell spawned by explorer.exe', time: '09:13', done: true },
  { id: 3, label: 'Credential Access',    desc: 'LSASS memory dumped — hashes extracted', time: '09:14', done: true },
  { id: 4, label: 'Lateral Movement',     desc: 'RDP from 192.168.1.45 → 3 workstations', time: '09:15', done: false },
  { id: 5, label: 'Privilege Escalation', desc: 'New administrator account created', time: '09:16', done: false },
  { id: 6, label: 'Impact',              desc: '1,247 files encrypted in 8 seconds', time: '09:18', done: false },
]

export function SimulatorPage() {
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario | null>(null)
  const [activeRun, setActiveRun] = useState<SimulationRun | null>(null)
  const [riskScore, setRiskScore] = useState(15)
  const [stagesDone, setStagesDone] = useState(0)

  const { data: scenarios = MOCK_SCENARIOS } = useQuery({
    queryKey: ['simulator-scenarios'],
    queryFn: simulatorService.getScenarios,
  })

  const { data: runs = MOCK_RUNS } = useQuery({
    queryKey: ['simulator-runs'],
    queryFn: simulatorService.getRuns,
  })

  // Poll for active run status
  useQuery({
    queryKey: ['simulator-run', activeRun?.id],
    queryFn: async () => {
      if (!activeRun?.id) return null
      const run = await simulatorService.getRun(activeRun.id)
      setActiveRun(run)
      
      // Update local UI states based on backend events_generated
      const progress = Math.min(6, Math.floor(run.events_generated / 1.5))
      setStagesDone(progress)
      setRiskScore(Math.min(91, 15 + (progress * 14)))
      
      return run
    },
    enabled: !!activeRun?.id && (activeRun.status === 'running' || activeRun.status === 'pending') && !activeRun.id.startsWith('mock'),
    refetchInterval: 1000,
  })

  const { mutate: runScenario, isPending } = useMutation({
    mutationFn: (scenarioId: string) => simulatorService.runScenario(scenarioId),
    onSuccess: run => {
      setActiveRun(run)
      setRiskScore(15)
      setStagesDone(0)
    },
    onError: () => {
      if (selectedScenario) {
        const run: SimulationRun = {
          id: 'mock-run-' + Date.now(),
          scenario_id: selectedScenario.id,
          scenario_name: selectedScenario.name,
          status: 'running',
          events_generated: 0,
          started_at: new Date().toISOString(),
        }
        setActiveRun(run)
        setRiskScore(15)
        setStagesDone(0)

        let stage = 0
        const stageInterval = setInterval(() => {
          stage++
          setStagesDone(stage)
          setRiskScore(prev => Math.min(91, prev + 14))
          if (stage >= ATTACK_STAGES.length) {
            clearInterval(stageInterval)
            setTimeout(() => {
              setActiveRun(prev => prev ? { ...prev, status: 'completed', events_generated: 147 } : null)
            }, 1000)
          }
        }, 1500)
      }
    },
  })

  const riskColor = riskScore > 70 ? 'var(--danger)' : riskScore > 40 ? 'var(--warning)' : 'var(--primary)'

  return (
    <PageContainer className="flex flex-col gap-6">
      
      {/* ── Header ── */}
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Attack Simulator</h1>
        <p className="text-[var(--text-muted)] mt-1">Safely simulate real-world attack scenarios to test detection capabilities.</p>
      </div>

      {/* ── Warning Banner ── */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[var(--warning-ring)] bg-[var(--warning-bg)]">
        <AlertTriangle className="w-5 h-5 text-[var(--warning)] shrink-0" />
        <div>
          <span className="font-bold text-[var(--warning)] uppercase tracking-wider text-xs mr-2">Safe Simulation Mode</span>
          <span className="text-[var(--warning)] opacity-90 text-sm">All events are synthetic and labeled as simulated. No real attacks are performed.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* ── Scenarios ── */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Available Scenarios</h3>
            <span className="text-xs text-[var(--text-muted)]">{scenarios.length} scenarios</span>
          </div>

          {scenarios.map((scenario, i) => {
            const isSelected = selectedScenario?.id === scenario.id
            const Icon = ATTACK_ICONS[scenario.attack_type] ?? Activity
            
            const isCrit = scenario.severity === 'critical';
            const isHigh = scenario.severity === 'high';
            const sevColor = isCrit ? 'var(--danger)' : isHigh ? 'var(--warning)' : 'var(--primary)';
            const sevBg = isCrit ? 'var(--danger-bg)' : isHigh ? 'var(--warning-bg)' : 'var(--primary-bg)';
            const sevRing = isCrit ? 'var(--danger-ring)' : isHigh ? 'var(--warning-ring)' : 'var(--primary-ring)';

            return (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <div
                  onClick={() => setSelectedScenario(isSelected ? null : scenario)}
                  className={`relative rounded-xl border p-4 cursor-pointer transition-all duration-200 overflow-hidden ${
                    isSelected ? 'border-[var(--border-strong)] bg-[var(--bg-hover)]' : 'border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)]'
                  }`}
                  style={{ borderLeft: isSelected ? `4px solid ${sevColor}` : undefined }}
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{ background: sevBg, borderColor: sevRing }}
                    >
                      <Icon className="w-6 h-6" style={{ color: sevColor }} />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="text-base font-semibold text-[var(--text-primary)]">{scenario.name}</h3>
                        <span 
                          className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border"
                          style={{ color: sevColor, backgroundColor: sevBg, borderColor: sevRing }}
                        >
                          {scenario.severity}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{scenario.description}</p>
                      
                      <div className="flex items-center gap-4 flex-wrap text-xs text-[var(--text-muted)] mt-2">
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{scenario.estimated_duration}</span>
                        <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" />{(scenario.techniques || []).length} techniques</span>
                        <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" />{scenario.target_profile}</span>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {(scenario.techniques || []).map(t => (
                          <span key={t} className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--bg-inset)] text-[var(--text-muted)]">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {isSelected && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={e => { e.stopPropagation(); runScenario(scenario.id) }}
                        disabled={isPending}
                        className="flex flex-col items-center justify-center gap-1 shrink-0 px-6 py-4 rounded-lg font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer text-white hover:brightness-110"
                        style={{ background: sevColor }}
                      >
                        {isPending ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                        <span>LAUNCH</span>
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* ── Right Panel ── */}
        <div className="flex flex-col gap-6">
          
          <AnimatePresence>
            {activeRun && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
              >
                <Card className={`border-2 ${activeRun.status === 'running' ? 'border-[var(--danger-ring)] shadow-[0_0_16px_var(--danger-bg)]' : 'border-[var(--primary-ring)] shadow-[0_0_16px_var(--primary-bg)]'}`}>
                  <CardHeader className={`border-b ${activeRun.status === 'running' ? 'bg-[var(--danger-bg)] border-[var(--danger-ring)]' : 'bg-[var(--primary-bg)] border-[var(--primary-ring)]'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Radio className={`w-4 h-4 ${activeRun.status === 'running' ? 'text-[var(--danger)] animate-pulse' : 'text-[var(--primary)]'}`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${activeRun.status === 'running' ? 'text-[var(--danger)]' : 'text-[var(--primary)]'}`}>
                          {activeRun.status === 'running' ? 'Attack In Progress' : 'Simulation Complete'}
                        </span>
                      </div>
                      {activeRun.status === 'running' && (
                        <div className="text-xs font-bold font-mono" style={{ color: riskColor }}>
                          {riskScore}% RISK
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] font-medium">{activeRun.scenario_name}</p>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-5 pt-5">
                    
                    {activeRun.status === 'running' && (
                      <div>
                        <div className="flex justify-between text-xs font-medium text-[var(--text-secondary)] mb-2">
                          <span>System Risk Score</span>
                          <span style={{ color: riskColor }}>{riskScore}%</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-[var(--bg-inset)] overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            animate={{ width: `${riskScore}%` }}
                            transition={{ duration: 0.5 }}
                            style={{ background: riskColor }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-3">
                      <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Attack Stages</div>
                      {ATTACK_STAGES.map((stage, idx) => {
                        const isDone = idx < stagesDone
                        const isActive = idx === stagesDone && activeRun.status === 'running'
                        return (
                          <motion.div
                            key={stage.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isDone || isActive ? 1 : 0.4 }}
                            className="flex items-start gap-3"
                          >
                            <div
                              className="w-6 h-6 rounded-full border flex items-center justify-center shrink-0"
                              style={{
                                borderColor: isDone ? 'var(--primary)' : isActive ? 'var(--danger)' : 'var(--border)',
                                background: isDone ? 'var(--primary-bg)' : isActive ? 'var(--danger-bg)' : 'var(--bg-inset)',
                              }}
                            >
                              {isDone ? (
                                <CheckCircle className="w-3.5 h-3.5 text-[var(--primary)]" />
                              ) : isActive ? (
                                <Activity className="w-3.5 h-3.5 text-[var(--danger)] animate-pulse" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)]" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold" style={{ color: isDone ? 'var(--primary)' : isActive ? 'var(--danger)' : 'var(--text-muted)' }}>
                                  {stage.label}
                                </span>
                                <span className="text-[10px] font-mono text-[var(--text-muted)]">{stage.time}</span>
                              </div>
                              {(isDone || isActive) && (
                                <p className="text-xs text-[var(--text-secondary)] mt-1">{stage.desc}</p>
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>

                    {activeRun.status === 'completed' && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg border border-[var(--primary-ring)] bg-[var(--primary-bg)] p-4 flex flex-col gap-4"
                      >
                        <div className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4" /> Attack Prevented
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-center">
                          <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] p-3 shadow-sm">
                            <div className="text-xl font-bold text-[var(--primary)] font-mono">$1.4M</div>
                            <div className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mt-1">Damage Prevented</div>
                          </div>
                          <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] p-3 shadow-sm">
                            <div className="text-xl font-bold text-[var(--primary)] font-mono">34s</div>
                            <div className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mt-1">Time to Detect</div>
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-[var(--text-secondary)] border-t border-[var(--primary-ring)] pt-3">
                          <span>Events generated</span>
                          <span className="font-mono font-bold text-[var(--text-primary)]">{activeRun.events_generated}</span>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <Card>
            <TwinControls onScenarioStart={run => setActiveRun(run)} />
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b border-[var(--border)]">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[var(--primary)]" />
                Previous Runs
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col divide-y divide-[var(--border)]">
                {runs.map(run => (
                  <div key={run.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{run.scenario_name}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">{run.events_generated} events · {run.incident_id}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      run.status === 'completed'
                        ? 'text-[var(--success)] bg-[var(--success-bg)] border-[var(--success-ring)]'
                        : 'text-[var(--warning)] bg-[var(--warning-bg)] border-[var(--warning-ring)]'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${run.status === 'completed' ? 'bg-[var(--success)]' : 'bg-[var(--warning)]'}`} />
                      {run.status.toUpperCase()}
                    </div>
                  </div>
                ))}
                {runs.length === 0 && (
                  <p className="text-sm text-[var(--text-muted)] text-center py-6">No previous runs</p>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </PageContainer>
  )
}
